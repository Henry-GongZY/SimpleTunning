#pragma once

#include "isp/node.h"
#include <opencv2/imgproc.hpp>

namespace isp::nodes {

class ToneMappingNode : public ISPNode {
public:
    ToneMappingNode(const std::string& id)
        : ISPNode(id, "ToneMapping") {
        addParam("float", "gamma", 2.2f, 0.1f, 10.0f);
        addParam("float", "exposure", 0.0f, -5.0f, 5.0f);
        addParam("float", "contrast", 1.0f, 0.0f, 3.0f);
    }

    ImageData process(const ImageData& input) override {
        if (!input || input->empty()) return nullptr;

        auto gamma = std::any_cast<float>(getParam("gamma"));
        auto exposure = std::any_cast<float>(getParam("exposure"));
        auto contrast = std::any_cast<float>(getParam("contrast"));

        auto output = std::make_shared<cv::Mat>();
        input->convertTo(*output, CV_32F, contrast / 255.0, exposure);
        cv::pow(*output, 1.0 / gamma, *output);
        output->convertTo(*output, CV_8U, 255.0);

        return output;
    }
};

} // namespace isp::nodes
