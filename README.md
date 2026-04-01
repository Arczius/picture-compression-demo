# Picture Compression Demo
this demo react app shows how to use a simple compression algorithm to compress and decompress images. The algorithm is based on the idea of run-length encoding, which is a simple form of data compression that replaces sequences of the same data value with a single value and a count.

[live demo](https://picture-compression-demo.netlify.app/)

the algorithm works by iterating through the pixels of the image and counting the number of consecutive pixels that have the same color. When a different color is encountered, the algorithm stores the color and the count in a compressed format. The compressed data can then be decompressed to reconstruct the original image.

NOTE: it's not a very efficient algorithm, but it's a simple example to demonstrate the concept of compression and decompression. it's also not optimized for performance, so it may not be suitable for large images or real-time applications. 