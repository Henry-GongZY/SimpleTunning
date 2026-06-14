#pragma once

#include "isp/node.h"
#include <opencv2/imgproc.hpp>

namespace isp::nodes {

class DenoiseNode : public ISPNode {
public:
    DenoiseNode(const std::string& id)
        : ISPNode(id, "Denoise") {
        addParam("float", "sigma_color", 15.0f, 0.0f, 100.0f);
        addParam("float", "sigma_space", 8.0f, 0.0f, 100.0f);
        addParam("int", "kernel_size", 5, 3, 15);
    }

    ImageData process(const ImageData& input) override {
        if (!input || input->empty()) return nullptr;

        auto sigma_c = std::any_cast<float>(getParam("sigma_color"));
        auto sigma_s = std::any_cast<float>(getParam("sigma_space"));
        auto ksize = std::any_cast<int>(getParam("kernel_size"));

        auto output = std::make_shared<cv::Mat>();
        cv::bilateralFilter(*input, *output, ksize, sigma_c, sigma_s);
        return output;
    }
};

} // namespace isp::nodes
