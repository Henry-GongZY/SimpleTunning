#include "isp/cache.h"
#include "isp/hash_utils.h"
#include <opencv2/imgproc.hpp>

namespace isp {

bool ExecutionCache::isValid(const std::string& node_id, const std::string& hash) const {
    auto it = cache_.find(node_id);
    if (it == cache_.end()) return false;
    return it->second.hash == hash;
}

std::shared_ptr<cv::Mat> ExecutionCache::get(const std::string& node_id) const {
    auto it = cache_.find(node_id);
    if (it != cache_.end()) {
        return it->second.output;
    }
    return nullptr;
}

void ExecutionCache::store(const std::string& node_id, const std::string& hash,
                            const std::shared_ptr<cv::Mat>& output) {
    cache_[node_id] = {hash, output, 0};
}

void ExecutionCache::invalidate(const std::string& node_id) {
    cache_.erase(node_id);
}

void ExecutionCache::clear() {
    cache_.clear();
}

std::string ExecutionCache::computeImageHash(const cv::Mat& image) {
    if (image.empty()) return "empty";

    // Simple hash: downsample + checksum first N pixels
    cv::Mat small;
    cv::resize(image, small, cv::Size(64, 64));

    return simpleHash(small.data, small.total() * small.elemSize());
}

} // namespace isp
