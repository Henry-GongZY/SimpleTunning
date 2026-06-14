cmake_minimum_required(VERSION 3.20)
project(SimpleTunningEngine VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# MSVC: force UTF-8 for Chinese locale compatibility
if(MSVC)
    add_compile_options("/utf-8")
endif()

# ============================================================
# Dependencies (all in extern/ via git submodules)
# ============================================================
set(EXTERN_DIR ${CMAKE_CURRENT_SOURCE_DIR}/extern)

# pybind11 — header-only Python binding library
add_subdirectory(${EXTERN_DIR}/pybind11)

# nlohmann/json — header-only JSON parser
# taskflow — header-only parallel task graph engine
# Both are single headers / include-only, no build needed.

# ============================================================
# OpenCV — find system installation
# ============================================================
set(OpenCV_DIR "C:/opencv/build" CACHE PATH "OpenCV install directory")
find_package(OpenCV QUIET)

if(NOT OpenCV_FOUND)
    # Manual fallback: bypass version check, link directly
    if(EXISTS "C:/opencv/build")
        message(STATUS "OpenCV: using manual paths from C:/opencv/build")
        set(OPENCV_INCLUDE_DIR "C:/opencv/build/include")
        if(EXISTS "C:/opencv/build/x64/vc18/lib")
            set(OPENCV_LIB_DIR "C:/opencv/build/x64/vc18/lib")
        elseif(EXISTS "C:/opencv/build/x64/vc16/lib")
            set(OPENCV_LIB_DIR "C:/opencv/build/x64/vc16/lib")
        endif()
        set(OPENCV_LIBS "${OPENCV_LIB_DIR}/opencv_world4120.lib")
    else()
        message(FATAL_ERROR
            "OpenCV not found.\n"
            "  Install via vcpkg:  vcpkg install opencv4:x64-windows\n"
            "  Or download from:   https://opencv.org/releases/\n"
            "  Set OpenCV_DIR to the build directory."
        )
    endif()
endif()

# ============================================================
# Source files
# ============================================================
set(SOURCES
    src/node.cpp
    src/pipeline.cpp
    src/cache.cpp
    src/memory_pool.cpp
    src/nodes/raw_reader.cpp
)

# ============================================================
# Pybind11 Python module (includes all core sources)
# ============================================================
pybind11_add_module(isp_engine
    bindings/pybind_module.cpp
    ${SOURCES}
)

target_include_directories(isp_engine PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${CMAKE_CURRENT_SOURCE_DIR}/extern/json/include
    ${CMAKE_CURRENT_SOURCE_DIR}/extern/taskflow
)

if(OPENCV_INCLUDE_DIR)
    target_include_directories(isp_engine PRIVATE ${OPENCV_INCLUDE_DIR})
endif()

target_link_libraries(isp_engine PRIVATE ${OPENCV_LIBS})
