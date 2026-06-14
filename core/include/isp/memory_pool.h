#pragma once

#include <opencv2/core.hpp>
#include <memory>
#include <mutex>
#include <unordered_map>
#include <string>

namespace isp {

// Zero-copy memory pool for intermediate pipeline results.
// All nodes share ImageData (std::shared_ptr<cv::Mat>) so frames
// are never deep-copied between processing stages.
class MemoryPool {
public:
    // Allocate or reuse a mat with given dimensions
    std::shared_ptr<cv::Mat> acquire(int rows, int cols, int type);

    // Release a reference (automatic via shared_ptr destructor)
    // Pool keeps a weak_ptr to optionally recycle buffers.

    // Store a named intermediate (for visualization)
    void stash(const std::string& key, std::shared_ptr<cv::Mat> data);
    std::shared_ptr<cv::Mat> retrieve(const std::string& key) const;
    void release(const std::string& key);

    // Stats
    size_t activeAllocations() const;
    size_t stashedCount() const;

private:
    mutable std::mutex mutex_;
    std::unordered_map<std::string, std::shared_ptr<cv::Mat>> stashed_;
    std::vector<std::weak_ptr<cv::Mat>> pool_;
};

} // namespace isp
