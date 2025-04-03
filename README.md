# Multiwindow Dicom Viewer

## Introduction

This is an open source multi-window DICOM viewer built on top of Bluelight, a browser-based DICOM viewer (https://github.com/cylab-tw/bluelight).  

Currently, when viewing CT images, radiologists are limited to viewing small windows of grayscale values (e.g. lung window, soft tissue window, bone window, etc.). However, this presents several challenges, particularly in oncological imaging. Reviewing imaging during tumor board discussion is frequently slow and cumbersome, as screen size is limited and  masses often span anatomical regions that require different windowing to view on CT (i.e. lung masses that abut the diaphragm or infiltrate the mediastinum.) This project allows for multiple window levels to be displayed at once, allowing for easier communication with and visualization for non-radiologists, tumor board discussions, and patient education. 

See the demo here: https://dicomdude.github.io/multiwindow-dicom-viewer/bluelight/html/start.html

## Table of contents
<!--ts-->
   * [Installation](#installation)
   * [References](#references)
<!--te-->

<a name="installation"></a>
## Installation
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

<a name="references"></a>
## References
1. Chen, TT., Sun, YC., Chu, WC. et al. BlueLight: An Open Source DICOM Viewer Using Low-Cost Computation Algorithm Implemented with JavaScript Using Advanced Medical Imaging Visualization. J Digit Imaging 36, 753–763 (2023). https://doi.org/10.1007/s10278-022-00746-0
2. Nguyen NC, Vejdani K. Multipurpose computed tomography window for fusion display with functional imaging. World J Nucl Med. 2018 Jul-Sep;17(3):145-150. doi: 10.4103/wjnm.WJNM_34_17. PMID: 30034277; PMCID: PMC6034539.
