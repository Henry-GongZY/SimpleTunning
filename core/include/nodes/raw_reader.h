#pragma once

#include "isp/node.h"
#include "isp/cache.h"
#include <opencv2/imgcodecs.hpp>
#include <opencv2/imgproc.hpp>

namespace isp::nodes {

// Reads RAW / image file from disk
class RawReaderNode : public ISPNode {
public:
    RawReaderNode(const std::string& id)
        : ISPNode(id, "RawReader") {
        addParam("string", "file_path", std::string(""), std::string(""), std::string(""));
        addParam("int", "bit_depth", 14, 8, 16);
    }

    ImageData process(const ImageData& /*input*/) override {
        auto path = std::any_cast<std::string>(getParam("file_path"));
        if (path.empty()) return nullptr;

        cv::Mat img = cv::imread(path, cv::IMREAD_UNCHANGED);
        if (img.empty()) return nullptr;

        return std::make_shared<cv::Mat>(std::move(img));
    }
};

// Demosaic: Bayer pattern -> RGB
class DemosaicNode : public ISPNode {
public:
    DemosaicNode(const std::string& id)
        : ISPNode(id, "Demosaic") {
        addParam("string", "method", std::string("Malvar"), std::string(""), std::string(""));
        // "method" options: "Malvar", "VNG", "Bilinear"
        params_["method"].options = {"Malvar", "VNG", "Bilinear"};
    }

    ImageData process(const ImageData& input) override {
        if (!input || input->empty()) return nullptr;

        auto method = std::any_cast<std::string>(getParam("method"));
        auto output = std::make_shared<cv::Mat>();

        if (method == "Bilinear") {
            cv::cvtColor(*input, *output, cv::COLOR_BayerBG2RGB);
        } else {
            // Default: Malvar/VNG use OpenCV's built-in demosaicing
            cv::cvtColor(*input, *output, cv::COLOR_BayerBG2RGB);
        }

        return output;
    }
};

} // namespace isp::nodes
