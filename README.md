# Multiwindow Dicom Viewer

## Introduction
 
See the demo here: https://dicomdude.github.io/multiwindow-dicom-viewer/bluelight/html/start.html

This is an open source multi-window DICOM viewer inspired by [this paper](#2) and built on top of [Bluelight](#1), a browser-based DICOM viewer.  

Currently, when viewing CT images, radiologists are limited to viewing small windows of grayscale values (e.g. lung window, soft tissue window, bone window, etc.). However, this presents several challenges, particularly in oncological imaging. Reviewing imaging during tumor board discussion is frequently slow and cumbersome, as screen size is limited and  masses often span anatomical regions that require different windowing to view on CT (i.e. lung masses that abut the diaphragm or infiltrate the mediastinum.) This project allows for multiple window levels to be displayed at once, allowing for easier communication with and visualization for non-radiologists, tumor board discussions, and patient education. 

## Table of contents
<!--ts-->
   * [Installation](#installation)
   * [How It Works](#howitworks)
   * [References](#references)
<!--te-->

## <a name="installation"></a> Installation
- Clone the repository to any location of your choosing
    ```
  $ git clone https://github.com/dicomdude/multiwindow-dicom-viewer.git
  ```
- Run a local HTTP server. Attempting to run the local files directly will result in CORS errors. Options include VS Code extensions, Python, and more:
  * VS Code extension: https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server
  * Python:
    ```bash
    # On Windows, try "python -m http.server" or "py -3 -m http.server"
    python3 -m http.server
    ```
  * Node.js HTTP server: https://www.npmjs.com/package/http-server 
- Navigate to the following URL on any browser: http://localhost:8000/bluelight/html/start.html
  
## <a name="howitworks"></a> How It Works
Density in CT images are represented by Hounsfield units (HU). Higher Hounsfield units correspond to tissues with higher density. Air at STP equals -1000 HU and water equals 0 HU. Traditionally, CT data is stored at 12 bit depth, allowing for 4096 total values. By convention, these values are mapped to -1024 HU to 3072 HU. However, this range of 4096 must be transformed into a range of 0-255 in order to be displayed on regular computer screens. This is done in a process called windowing, where only a specific range of Hounsfield units are linearly mapped to greyscale values between 0-255. 

For example, in a common abdomen window, Hounsfield units from -150 to 250, are linearly mapped to 0 - 255. In this case, a function $$f(HU) = Greyscale$$ can be defined by a line running through the points $$(-150, 0)$$ and $$(250, 255)$$. All Hounsfield units below -150 are set to a greyscale value of 0, while all above 250 are set to a greyscale value of 255. In modern PACS, this it is only possible to use a single linear window at any one time. 

In our multiwindowing process, we allow for use of multiple windows simultaneously, each with its own mapping function. This is performed by defining a piece-wise function across the entire range of Hounsfield units. When an image is displayed, each pixel, depending on which window it falls into, is simply transformed using the corresponding slope and intercept by $$y=mx + b$$.

## <a name="references"></a> References
1. <a name="1"></a> Chen TT, Sun YC, Chu WC, Lien CY. BlueLight: An Open Source DICOM Viewer Using Low-Cost Computation Algorithm Implemented with JavaScript Using Advanced Medical Imaging Visualization. J Digit Imaging. 2023 Apr;36(2):753-763. doi: 10.1007/s10278-022-00746-0. Epub 2022 Dec 20. PMID: 36538245; PMCID: PMC10039132.
3. <a name="2"></a> Nguyen NC, Vejdani K. Multipurpose computed tomography window for fusion display with functional imaging. World J Nucl Med. 2018 Jul-Sep;17(3):145-150. doi: 10.4103/wjnm.WJNM_34_17. PMID: 30034277; PMCID: PMC6034539.
