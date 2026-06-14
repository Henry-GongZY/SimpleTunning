#pragma once

#include "node.h"
#include <vector>
#include <queue>
#include <memory>
#include <optional>

namespace isp {

struct PipelineEdge {
    std::string source_id;
    std::string target_id;
};

struct PipelineConfig {
    std::string pipeline_id;
    std::vector<std::shared_ptr<ISPNode>> nodes;
    std::vector<PipelineEdge> edges;
};

// DAG scheduler using topological sort
class Pipeline {
public:
    explicit Pipeline(PipelineConfig config);

    // Execute entire pipeline with smart caching
    ImageData execute(const ImageData& input);

    // Execute only changed subset (incremental update)
    ImageData executeIncremental(const ImageData& input,
                                 const std::vector<std::string>& changed_nodes);

    // Get intermediate result for a specific node (for visualization)
    std::optional<ImageData> getIntermediateResult(const std::string& node_id) const;

    // Pipeline metadata
    const PipelineConfig& config() const { return config_; }
    const std::vector<std::string>& executionOrder() const { return topo_order_; }

private:
    void buildDAG();
    std::vector<std::string> topologicalSort();
    std::vector<std::string> computeAffectedNodes(const std::vector<std::string>& changed);

    PipelineConfig config_;

    // Adjacency representation
    std::unordered_map<std::string, std::vector<std::string>> successors_;
    std::unordered_map<std::string, std::vector<std::string>> predecessors_;
    std::unordered_map<std::string, ISPNode*> node_map_;

    std::vector<std::string> topo_order_;
    bool dag_valid_ = false;
};

// Parse pipeline config from JSON string
PipelineConfig parsePipelineJSON(const std::string& json_str);

} // namespace isp
