#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include "isp/node.h"
#include "isp/pipeline.h"

#include "nodes/raw_reader.h"
#include "nodes/denoise.h"
#include "nodes/tone_mapping.h"

namespace py = pybind11;
using namespace isp;

// Helper: get dict of all registered node types with their parameters
py::dict getNodeLibrary() {
    py::dict lib;
    lib["RawReader"] = py::dict(
        py::arg("category") = "input",
        py::arg("label") = "RAW Reader"
    );
    lib["Demosaic"] = py::dict(
        py::arg("category") = "cfa",
        py::arg("label") = "Demosaic"
    );
    lib["Denoise"] = py::dict(
        py::arg("category") = "denoise",
        py::arg("label") = "Bilateral Denoise"
    );
    lib["ToneMapping"] = py::dict(
        py::arg("category") = "color",
        py::arg("label") = "Tone Mapping"
    );
    return lib;
}

PYBIND11_MODULE(isp_engine, m) {
    m.doc() = "SimpleTunning ISP Engine - C++ image processing pipeline";

    // ---- PipelineEdge ----
    py::class_<PipelineEdge>(m, "PipelineEdge")
        .def(py::init<>())
        .def_readwrite("source_id", &PipelineEdge::source_id)
        .def_readwrite("target_id", &PipelineEdge::target_id);

    // ---- ISPNode ----
    py::class_<ISPNode, std::shared_ptr<ISPNode>>(m, "ISPNode")
        .def("id", &ISPNode::id)
        .def("type", &ISPNode::type)
        .def("set_param", &ISPNode::setParam)
        .def("get_param", [](ISPNode& self, const std::string& name) -> py::object {
            auto val = self.getParam(name);
            if (!val.has_value()) return py::none();

            // Try to cast to common types
            if (val.type() == typeid(int)) return py::cast(std::any_cast<int>(val));
            if (val.type() == typeid(float)) return py::cast(std::any_cast<float>(val));
            if (val.type() == typeid(double)) return py::cast(std::any_cast<double>(val));
            if (val.type() == typeid(bool)) return py::cast(std::any_cast<bool>(val));
            if (val.type() == typeid(std::string)) return py::cast(std::any_cast<std::string>(val));
            return py::none();
        })
        .def("compute_hash", &ISPNode::computeHash);

    // ---- PipelineConfig ----
    py::class_<PipelineConfig>(m, "PipelineConfig")
        .def(py::init<>())
        .def_readwrite("pipeline_id", &PipelineConfig::pipeline_id)
        .def_readwrite("nodes", &PipelineConfig::nodes)
        .def_readwrite("edges", &PipelineConfig::edges);

    // ---- Functions ----
    m.def("parse_pipeline_json", &parsePipelineJSON,
          py::arg("json_str"),
          "Parse a pipeline configuration from JSON string");

    m.def("create_node", &createNode,
          py::arg("type"), py::arg("id"),
          "Create an ISP node by type name");

    m.def("get_node_library", &getNodeLibrary,
          "Get dict of all registered node types");

    m.def("get_registered_node_types", []() {
        std::vector<std::string> types;
        for (const auto& [name, _] : getRegisteredNodeTypes()) {
            types.push_back(name);
        }
        return types;
    }, "List all registered node type names");
}
