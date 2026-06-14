#include "nodes/raw_reader.h"
#include "nodes/denoise.h"
#include "nodes/tone_mapping.h"

// Implementations for nodes declared in headers
// (Most logic is inline in headers for brevity; complex nodes get .cpp files)

namespace isp::nodes {

// Registration helpers
struct AutoRegister {
    AutoRegister() {
        registerNodeType("RawReader", [](const std::string& id) {
            return std::make_unique<RawReaderNode>(id);
        });
        registerNodeType("Demosaic", [](const std::string& id) {
            return std::make_unique<DemosaicNode>(id);
        });
        registerNodeType("Denoise", [](const std::string& id) {
            return std::make_unique<DenoiseNode>(id);
        });
        registerNodeType("ToneMapping", [](const std::string& id) {
            return std::make_unique<ToneMappingNode>(id);
        });
    }
};

static AutoRegister auto_register;

} // namespace isp::nodes
