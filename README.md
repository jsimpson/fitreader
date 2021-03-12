# FitReader

This is a Deno library that is largely a port of the Ruby [fitreader](https://github.com/richardbrodie/fitreader) library. It is capable of parsing and decoding .FIT files, which are a binary data format used by GPS devices and various sensors. It should be noted, it has **only** been tested and proven to support _my_ Garmin Venu .FIT files and a few .FTI files that I found in other repositories. YMMV.

It has a very small API footprint, exposing a single class which is capable of handling all of the processing.

## Usage

See [mod.ts](mod.ts).
