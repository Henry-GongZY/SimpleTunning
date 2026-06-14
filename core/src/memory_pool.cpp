#include "isp/memory_pool.h"
#include <algorithm>

namespace isp {

std::shared_ptr<cv::Mat> MemoryPool::acquire(int rows, int cols, int type) {
    std::lock_guard<std::mutex> lock(mutex_);

    // Try to find a reusable buffer of matching size
    auto it = std::find_if(pool_.begin(), pool_.end(),
        [&](const std::weak_ptr<cv::Mat>& wp) {
            if (auto sp = wp.lock()) {
                return sp->rows == rows && sp->cols == cols && sp->type() == type;
            }
            return false;
        });

    if (it != pool_.end()) {
        if (auto sp = it->lock()) {
            return sp;
        }
    }

    return std::make_shared<cv::Mat>(rows, cols, type);
}

void MemoryPool::stash(const std::string& key, std::shared_ptr<cv::Mat> data) {
    std::lock_guard<std::mutex> lock(mutex_);
    stashed_[key] = std::move(data);
}

std::shared_ptr<cv::Mat> MemoryPool::retrieve(const std::string& key) const {
    std::lock_guard<std::mutex> lock(mutex_);
    auto it = stashed_.find(key);
    if (it != stashed_.end()) {
        return it->second;
    }
    return nullptr;
}

void MemoryPool::release(const std::string& key) {
    std::lock_guard<std::mutex> lock(mutex_);
    stashed_.erase(key);
}

size_t MemoryPool::activeAllocations() const {
    std::lock_guard<std::mutex> lock(mutex_);
    size_t count = 0;
    for (const auto& wp : pool_) {
        if (!wp.expired()) ++count;
    }
    return count;
}

size_t MemoryPool::stashedCount() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return stashed_.size();
}

} // namespace isp
