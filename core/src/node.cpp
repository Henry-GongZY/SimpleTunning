#include "isp/node.h"
#include "isp/hash_utils.h"

namespace isp {

// Global node factory registry
static std::unordered_map<std::string, NodeFactory>& getFactoryRegistry() {
    static std::unordered_map<std::string, NodeFactory> registry;
    return registry;
}

void registerNodeType(const std::string& type, NodeFactory factory) {
    getFactoryRegistry()[type] = std::move(factory);
}

std::unique_ptr<ISPNode> createNode(const std::string& type, const std::string& id) {
    auto& registry = getFactoryRegistry();
    auto it = registry.find(type);
    if (it != registry.end()) {
        return it->second(id);
    }
    return nullptr;
}

const std::unordered_map<std::string, NodeFactory>& getRegisteredNodeTypes() {
    return getFactoryRegistry();
}

ISPNode::ISPNode(const std::string& id, const std::string& type)
    : id_(id), type_(type) {}

void ISPNode::registerParam(const ParamMeta& meta) {
    params_[meta.name] = meta;
    values_[meta.name] = meta.default_val;
}

void ISPNode::setParam(const std::string& name, const std::any& value) {
    values_[name] = value;
}

std::any ISPNode::getParam(const std::string& name) const {
    auto it = values_.find(name);
    if (it != values_.end()) {
        return it->second;
    }
    return {};
}

std::string ISPNode::computeHash() const {
    // Simple hash from type + all param values
    std::ostringstream oss;
    oss << type_ << "|";
    for (const auto& [name, meta] : params_) {
        oss << name << "=";
        auto it = values_.find(name);
        if (it != values_.end()) {
            if (meta.type == "float") {
                oss << std::any_cast<float>(it->second);
            } else if (meta.type == "int") {
                oss << std::any_cast<int>(it->second);
            } else if (meta.type == "bool") {
                oss << std::any_cast<bool>(it->second);
            } else if (meta.type == "string") {
                oss << std::any_cast<std::string>(it->second);
            }
        }
        oss << ";";
    }

    return simpleHash(oss.str());
}

} // namespace isp
