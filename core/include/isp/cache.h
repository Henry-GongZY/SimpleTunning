#pragma once

#include <string>
#include <unordered_map>
#include <opencv2/core.hpp>
#include <memory>

namespace isp {

struct CacheEntry {
    std::string hash;       // Combined input + params hash
    std::shared_ptr<cv::Mat> output;
    uint64_t timestamp;
};

// Smart cache: skips node execution if input hash + param hash unchanged
class ExecutionCache {
public:
    // Check if cache is valid for given node
    bool isValid(const std::string& node_id, const std::string& hash) const;

    // Get cached result
    std::shared_ptr<cv::Mat> get(const std::string& node_id) const;

    // Store result with hash
    void store(const std::string& node_id, const std::string& hash,
               const std::shared_ptr<cv::Mat>& output);

    // Invalidate entries for a specific node
    void invalidate(const std::string& node_id);

    // Clear all cached data
    void clear();

    // Compute hash for an image (used for input hash)
    static std::string computeImageHash(const cv::Mat& image);

private:
    std::unordered_map<std::string, CacheEntry> cache_;
};

} // namespace isp
