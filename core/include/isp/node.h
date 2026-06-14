#pragma once

#include <opencv2/core.hpp>
#include <string>
#include <unordered_map>
#include <vector>
#include <functional>
#include <memory>
#include <any>

namespace isp {

using ImageData = std::shared_ptr<cv::Mat>;

// Parameter metadata for auto-registration
struct ParamMeta {
    std::string name;
    std::string type;   // "int", "float", "bool", "string", "enum"
    std::any default_val;
    std::any min;
    std::any max;
    std::vector<std::string> options; // for enum type
};

// Abstract base class for all ISP pipeline nodes
class ISPNode {
public:
    ISPNode(const std::string& id, const std::string& type);
    virtual ~ISPNode() = default;

    // Core processing interface
    virtual ImageData process(const ImageData& input) = 0;

    // Parameter management
    void setParam(const std::string& name, const std::any& value);
    std::any getParam(const std::string& name) const;
    const std::unordered_map<std::string, ParamMeta>& getParams() const { return params_; }

    // Hash computation for smart caching
    std::string computeHash() const;

    // Identity
    const std::string& id() const { return id_; }
    const std::string& type() const { return type_; }

protected:
    // Convenience: add a typed parameter with metadata
    void addParam(const std::string& type, const std::string& name,
                  std::any default_val, std::any min, std::any max) {
        ParamMeta meta;
        meta.name = name;
        meta.type = type;
        meta.default_val = std::move(default_val);
        meta.min = std::move(min);
        meta.max = std::move(max);
        registerParam(meta);
    }

    void registerParam(const ParamMeta& meta);

    std::string id_;
    std::string type_;
    std::unordered_map<std::string, ParamMeta> params_;
    std::unordered_map<std::string, std::any> values_;
};

// Node factory for dynamic instantiation
using NodeFactory = std::function<std::unique_ptr<ISPNode>(const std::string& id)>;
void registerNodeType(const std::string& type, NodeFactory factory);
std::unique_ptr<ISPNode> createNode(const std::string& type, const std::string& id);
const std::unordered_map<std::string, NodeFactory>& getRegisteredNodeTypes();

} // namespace isp
