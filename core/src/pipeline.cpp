#include "isp/pipeline.h"
#include "isp/cache.h"
#include "isp/memory_pool.h"
#include <stdexcept>
#include <algorithm>
#include <unordered_set>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

namespace isp {

Pipeline::Pipeline(PipelineConfig config) : config_(std::move(config)) {
    buildDAG();
}

void Pipeline::buildDAG() {
    node_map_.clear();
    successors_.clear();
    predecessors_.clear();

    for (auto& node : config_.nodes) {
        node_map_[node->id()] = node.get();
        successors_[node->id()] = {};
        predecessors_[node->id()] = {};
    }

    for (const auto& edge : config_.edges) {
        successors_[edge.source_id].push_back(edge.target_id);
        predecessors_[edge.target_id].push_back(edge.source_id);
    }

    topo_order_ = topologicalSort();
    dag_valid_ = true;
}

std::vector<std::string> Pipeline::topologicalSort() {
    std::unordered_map<std::string, int> in_degree;
    for (const auto& [id, _] : node_map_) {
        in_degree[id] = 0;
    }
    for (const auto& [id, preds] : predecessors_) {
        in_degree[id] = static_cast<int>(preds.size());
    }

    std::queue<std::string> q;
    for (const auto& [id, degree] : in_degree) {
        if (degree == 0) q.push(id);
    }

    std::vector<std::string> order;
    while (!q.empty()) {
        std::string current = q.front(); q.pop();
        order.push_back(current);

        for (const auto& succ : successors_[current]) {
            if (--in_degree[succ] == 0) {
                q.push(succ);
            }
        }
    }

    if (order.size() != node_map_.size()) {
        throw std::runtime_error("Pipeline contains a cycle!");
    }

    return order;
}

ImageData Pipeline::execute(const ImageData& input) {
    static ExecutionCache cache;
    static MemoryPool pool;

    pool.stash("input", input);

    ImageData current;
    for (const auto& node_id : topo_order_) {
        auto* node = node_map_[node_id];

        // Determine input for this node
        ImageData node_input;
        auto preds = predecessors_[node_id];
        if (preds.empty()) {
            node_input = input;
        } else if (preds.size() == 1) {
            node_input = pool.retrieve(preds[0]);
        } else {
            // Multiple inputs: merge (for now, just take first)
            node_input = pool.retrieve(preds[0]);
        }

        // Check cache
        std::string combined_hash = node->computeHash();
        if (node_input) {
            combined_hash += cache.computeImageHash(*node_input);
        }

        if (cache.isValid(node_id, combined_hash)) {
            current = cache.get(node_id);
        } else {
            current = node->process(node_input);
            cache.store(node_id, combined_hash, current);
        }

        pool.stash(node_id, current);
    }

    return current;
}

ImageData Pipeline::executeIncremental(const ImageData& input,
                                        const std::vector<std::string>& changed_nodes) {
    // Compute affected nodes (changed + downstream)
    auto affected = computeAffectedNodes(changed_nodes);

    // Invalidate cache for all affected nodes
    static ExecutionCache cache;
    for (const auto& node_id : affected) {
        cache.invalidate(node_id);
    }

    return execute(input);
}

std::vector<std::string> Pipeline::computeAffectedNodes(
    const std::vector<std::string>& changed) {

    std::unordered_set<std::string> affected(changed.begin(), changed.end());

    // BFS to find all downstream nodes
    std::queue<std::string> q;
    for (const auto& id : changed) q.push(id);

    while (!q.empty()) {
        std::string current = q.front(); q.pop();
        for (const auto& succ : successors_[current]) {
            if (affected.insert(succ).second) {
                q.push(succ);
            }
        }
    }

    return std::vector<std::string>(affected.begin(), affected.end());
}

std::optional<ImageData> Pipeline::getIntermediateResult(const std::string& node_id) const {
    static MemoryPool pool;
    auto result = pool.retrieve(node_id);
    if (result) return result;
    return std::nullopt;
}

// Parse pipeline JSON into config
PipelineConfig parsePipelineJSON(const std::string& json_str) {
    auto j = json::parse(json_str);

    PipelineConfig config;
    config.pipeline_id = j["pipeline_id"].get<std::string>();

    for (const auto& node_json : j["nodes"]) {
        std::string id = node_json["id"].get<std::string>();
        std::string type = node_json["type"].get<std::string>();

        auto node = createNode(type, id);
        if (!node) {
            throw std::runtime_error("Unknown node type: " + type);
        }

        // Apply parameters from JSON
        if (node_json.contains("params")) {
            for (const auto& [key, value] : node_json["params"].items()) {
                if (value.is_number_float()) {
                    node->setParam(key, value.get<float>());
                } else if (value.is_number_integer()) {
                    node->setParam(key, value.get<int>());
                } else if (value.is_boolean()) {
                    node->setParam(key, value.get<bool>());
                } else if (value.is_string()) {
                    node->setParam(key, value.get<std::string>());
                }
            }
        }

        config.nodes.emplace_back(std::move(node));
    }

    for (const auto& edge_json : j["edges"]) {
        PipelineEdge edge;
        edge.source_id = edge_json["source"].get<std::string>();
        edge.target_id = edge_json["target"].get<std::string>();
        config.edges.push_back(edge);
    }

    return config;
}

} // namespace isp
