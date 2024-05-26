
var openVR2 = false;
var VR2_LutArray = [];

function loadVR2() {
    var span = document.createElement("SPAN")
    span.innerHTML =
        ` <img class="img VR2" alt="VR2" id="ImgVR2" onmouseover = "onElementOver(this);" onmouseleave = "onElementLeave();" src="../image/icon/black/vr2.png" width="50" height="50">
        <img class="img VR2" alt="exitVR2" id="exitVR2" onmouseover="onElementOver(this);" onmouseleave="onElementLeave();" src="../image/icon/black/exit.png" width="50" height="50" style="display:none;" >
        <img class="img VR2" alt="moveVR2" id="moveVR2" onmouseover="onElementOver(this);" onmouseleave="onElementLeave();" src="../image/icon/black/b_Pan.png" width="50" height="50" style="display:none;" >
        <img class="img VR2" alt="windowVR2" id="windowVR2" onmouseover="onElementOver(this);" onmouseleave="onElementLeave();" src="../image/icon/black/b_Window.png" width="50" height="50" style="display:none;" > `;
    getByid("icon-list").appendChild(span);

    function createVR2_DIV(viewportNum = viewportNumber) {
        var DIV = document.createElement("DIV");
        DIV.id = "VR2_DIV";
        DIV.setAttribute("border", 2);
        DIV.style = "border-collapse:collapse";
        DIV.style.position = "absolute";
        DIV.style.backgroundColor = "black";
        DIV.style['zIndex'] = "200";
        DIV.style['width'] = DIV.style['height'] = "100%";
        DIV.style['left'] = DIV.style['top'] = "0px";
        DIV.style['display'] = "none";
        GetViewport(viewportNum).div.appendChild(DIV);
        var label = document.createElement("LABEL");
        label.innerText = "This is a test version.";
        label.style['zIndex'] = "500";
        label.style['color'] = "white";
        label.style['position'] = "absolute";
        label.style['font-size'] = "32px";
        label.style['user-select'] = "none";
        DIV.appendChild(label);
    }
    createVR2_DIV();

    BorderList_Icon.push("moveVR2");
    BorderList_Icon.push("windowVR2");

    function loadLut() {
        var request = new XMLHttpRequest();
        request.open('GET', "../data/lut/VR_Bones.txt");
        request.responseType = 'text';
        request.onload = function () {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    var lutstring = request.response;
                    lutstring = lutstring.replaceAll("\r\n", "\n");
                    var lutArray = lutstring.split("\n");
                    for (var i = 0; i < lutArray.length; i++) {
                        lutArray[i] = lutArray[i].split("\t");
                        for (var j = 0; j < lutArray[i].length; j++) {
                            lutArray[i][j] = parseInt(lutArray[i][j]);
                        }
                    }

                    if (lutArray.length == 256) {
                        for (var i = 0; i < lutArray.length; i++) {
                            if (lutArray[i][0] + lutArray[i][1] + lutArray[i][2] == 0) lutArray[i] = 0;
                            else {
                                lutArray[i] = parseInt(parseInt(lutArray[i][0]) +
                                    parseInt(256 * lutArray[i][1]) +
                                    parseInt(256 * 256 * lutArray[i][2]) +
                                    parseInt(256 * 256 * 256 * 255));
                            }
                        }
                        VR2_LutArray.push({ name: "VR Bones", array: lutArray });
                    }
                }
            }
        }
        request.send();
    }
    loadLut();
}
loadVR2();

function displayVR2() {
    getByid("VR2_DIV").style['display'] = "";
}

function hideVR2() {
    getByid("VR2_DIV").style['display'] = "none";
}

getByid("ImgVR2").onclick = function () {
    if (this.enable == false) return;
    openVR2 = !openVR2;
    img2darkByClass("VR2", !openVR2);

    getByid("exitVR2").style.display = openVR2 == true ? "" : "none";
    getByid("windowVR2").style.display = openVR2 == true ? "" : "none";
    getByid("moveVR2").style.display = openVR2 == true ? "" : "none";
    set_BL_model('VR2');
    initVR2();

    this.style.display = openVR2 != true ? "" : "none";
    getByid("exitVR2").onclick = function () {
        openVR2 = false;
        img2darkByClass("VR2", !openVR2);
        getByid("ImgVR2").style.display = openWriteGSPS != true ? "" : "none";
        getByid("exitVR2").style.display = openWriteGSPS == true ? "" : "none";
        getByid("windowVR2").style.display = openWriteRTSS == true ? "" : "none";
        getByid("moveVR2").style.display = openWriteRTSS == true ? "" : "none";
        for (cube of VRCube.VRCubeList) {
            cube.clear();
        }
        hideVR2();
        getByid("MouseOperation").click();
        displayMark();
        getByid('MouseOperation').click();
    }

    getByid("moveVR2").onclick = function () {
        VRCube.operate_mode = "move";
        drawBorder(getByid("moveVR2"));
    }

    getByid("windowVR2").onclick = function () {
        VRCube.operate_mode = "window";
        drawBorder(getByid("windowVR2"));
    }

    //getByid("MouseOperation_VR").click();
}

class VRCube {
    static VRCubeList = [];
    static operate_mode = "move";

    constructor(sop, slice = 15, step = 1) {
        this.sop = sop;
        this.sopList = sortInstance(sop);
        this.SOP = this.sopList[0];
        this.slice = slice;
        this.step = step;
        this.lut = "default";
        this.step_tmp = -1;

        this.scale = 1;
        this.pixelSpacing = this.SOP.image.rowPixelSpacing;

        this.rescaleMode = "resize";
        //if (step != 1) this.rescaleMode = "pixel";

        this.renderMode = "whole";
        this.width = this.SOP.image.width;
        this.height = this.SOP.image.height;
        this.windowCenter = this.SOP.image.windowCenter;
        this.windowWidth = this.SOP.image.windowWidth;

        if (this.width == this.height) this.stepFactor = getFactor(this.width);
        else this.stepFactor = [];

        this.ElemXs = [];
        this.ElemYs = [];
        this.ElemZs = [];
        this.container = null;
        this.VR2_Point = new Vector3(0, 0, 0);
        this.VR2_RotateDeg = new Vector3(0, 0, 0);
        this.offset = new Vector3(0, 0, 0);
        this.MouseDownCheck = false;
        this.MiddleDownCheck = false;
        this.RightMouseDownCheck = false;
        VRCube.VRCubeList.push(this);
    }

    resetZ() {
        for (var obj of this.ElemZs)
            this.container.removeChild(obj);
        this.ElemZs = [];
        this.buildZ();
        this.ReArrangeZ();
    }

    resetX() {
        for (var obj of this.ElemXs)
            this.container.removeChild(obj);
        this.ElemXs = [];
        this.buildX();
    }

    resetY() {
        for (var obj of this.ElemYs)
            this.container.removeChild(obj);
        this.ElemYs = [];
        this.buildY();
    }

    clear() {
        for (var obj of this.ElemXs)
            this.container.removeChild(obj);
        for (var obj of this.ElemYs)
            this.container.removeChild(obj);
        for (var obj of this.ElemZs)
            this.container.removeChild(obj);
        this.ElemXs = [];
        this.ElemYs = [];
        this.ElemZs = [];
        if (this.container) getByid("VR2_DIV").removeChild(this.container);
        if (this.userDIV) getByid("VR2_DIV").removeChild(this.userDIV);
        this.userDIV = null;
        this.container = null;
    }

    reflesh() {
        var offsety = (this.height / 1 / 2) - (this.height / this.step / 2);
        if (this.container) {
            this.container.style['transform-origin'] = `center ${(this.height / 2 - offsety)}px`
            this.container.style.transform =
                `translate(${this.offset[0]}px,${(this.offset[1] + (offsety))}px) scale(${this.scale * this.step}) rotateX(${this.VR2_RotateDeg[0]}deg) rotateY(${this.VR2_RotateDeg[1]}deg)`;// rotateZ(${this.VR2_RotateDeg[2]}deg) `
        }
    }

    buildContainer() {
        var DIV = getByid("VR2_DIV");
        var ContainerDIV = document.createElement("DIV");
        ContainerDIV.style['width'] = ContainerDIV.style['height'] = "100%";
        ContainerDIV.id = "VR2_Container";
        DIV.appendChild(ContainerDIV);
        this.container = ContainerDIV;

        function VR2Mousedown(e) {
            if (e.target.tagName != "CANVAS" && e.target.tagName != "DIV") return;
            if (e.which == 1) this.cube.MouseDownCheck = true;
            else if (e.which == 2) this.cube.MiddleDownCheck = true;
            else if (e.which == 3) this.cube.RightMouseDownCheck = true;
            this.cube.VR2_Point = [e.pageX, e.pageY];
            if (VRCube.operate_mode == "window") {
                var step = -1;
                if (this.cube.stepFactor) {
                    for (var i = 0; i < this.cube.stepFactor.length; i++) {
                        if (this.cube.stepFactor[i] >= 2 && this.cube.stepFactor[i] <= 15)
                            step = this.cube.stepFactor[i];
                    }
                }
                if (step != -1 && step > this.cube.step) {
                    this.cube.step_tmp = this.cube.step;
                    this.cube.step = step;
                }
            }
        }

        function VR2Mousemove(e) {
            if (VRCube.operate_mode == "window") {
                if (this.cube.MouseDownCheck) {
                    if (Math.abs(this.cube.VR2_Point[0] - e.pageX) > Math.abs(this.cube.VR2_Point[1] - e.pageY)) {
                        this.cube.windowCenter += (this.cube.VR2_Point[0] - e.pageX);
                    } else if (Math.abs(this.cube.VR2_Point[0] - e.pageX) < Math.abs(this.cube.VR2_Point[1] - e.pageY)) {
                        this.cube.windowWidth += (this.cube.VR2_Point[1] - e.pageY);
                    }
                    this.cube.resetZ();
                    this.cube.resetX();
                    this.cube.resetY();
                    this.cube.VR2_Point = [e.pageX, e.pageY];
                    this.cube.reflesh();
                }
            }
            if (VRCube.operate_mode == "move") {
                if (this.cube.MouseDownCheck) {
                    this.cube.VR2_RotateDeg[1] -= this.cube.VR2_Point[0] - e.pageX;
                    this.cube.VR2_RotateDeg[0] += this.cube.VR2_Point[1] - e.pageY;
                    this.cube.VR2_RotateDeg[1] -= this.cube.VR2_Point[0] * (180 / (180 % this.cube.VR2_Point[1])) - e.pageX;
                    this.cube.VR2_RotateDeg[0] += this.cube.VR2_Point[1] * (180 / (180 % this.cube.VR2_Point[0])) - e.pageY;
                    this.cube.VR2_RotateDeg[0] = (this.cube.VR2_RotateDeg[0] % 360 + 360) % 360;
                    this.cube.VR2_RotateDeg[1] = (this.cube.VR2_RotateDeg[1] % 360 + 360) % 360;
                    this.cube.reflesh();
                }
            }
            if (VRCube.operate_mode == "move" || VRCube.operate_mode == "window") {
                if (this.cube.MiddleDownCheck) {
                    this.cube.offset[0] -= this.cube.VR2_Point[0] - e.pageX;
                    this.cube.offset[1] -= this.cube.VR2_Point[1] - e.pageY;
                    this.cube.reflesh();
                }
                if (this.cube.RightMouseDownCheck) {
                    if (Math.abs(this.cube.VR2_Point[0] - e.pageX) > Math.abs(this.cube.VR2_Point[1] - e.pageY)) {
                        this.cube.scale -= (this.cube.VR2_Point[0] - e.pageX) * 0.02;
                        if (this.cube.scale > 3) this.cube.scale = 3;
                        else if (this.cube.scale < 0.1) this.cube.scale = 0.1;
                        this.cube.reflesh();
                    } else if (Math.abs(this.cube.VR2_Point[0] - e.pageX) < Math.abs(this.cube.VR2_Point[1] - e.pageY)) {
                        this.cube.scale += (this.cube.VR2_Point[1] - e.pageY) * 0.02;
                        if (this.cube.scale > 3) this.cube.scale = 3;
                        else if (this.cube.scale < 0.1) this.cube.scale = 0.1;
                        this.cube.reflesh();
                    }
                }
                this.cube.VR2_Point = [e.pageX, e.pageY];
            }
        }

        function VR2Mouseup(e) {
            this.cube.MouseDownCheck = false;
            this.cube.MiddleDownCheck = false;
            this.cube.RightMouseDownCheck = false;
            if (VRCube.operate_mode == "window") {
                if (this.cube.step_tmp != -1) {
                    this.cube.step = this.cube.step_tmp;
                    this.cube.step_tmp = -1;
                    this.cube.resetZ();
                    this.cube.resetX();
                    this.cube.resetY();
                    this.cube.reflesh();
                }

                if (!isNaN(this.cube.windowCenter)) this.cube.WCText.value = this.cube.windowCenter;
                if (!isNaN(this.cube.windowWidth)) this.cube.WWText.value = this.cube.windowWidth;
            }
        }
        VR2Mousedown = VR2Mousedown.bind({ cube: this });
        VR2Mousemove = VR2Mousemove.bind({ cube: this });
        VR2Mouseup = VR2Mouseup.bind({ cube: this });
        DIV.addEventListener("mousemove", VR2Mousemove, false);
        DIV.addEventListener("mousedown", VR2Mousedown, false);
        DIV.addEventListener("mouseup", VR2Mouseup, false);
    }

    buildInputer() {
        var userDIV = document.createElement("DIV");
        userDIV.style['flex-direction'] = "column";
        userDIV.style['float'] = "right";
        userDIV.style['display'] = "flex";
        this.userDIV = userDIV;
        getByid("VR2_DIV").appendChild(userDIV);

        //////////Slice//////////

        var sliceLable = document.createElement("LABEL");
        sliceLable.innerText = "Number of both sections";
        sliceLable.style['zIndex'] = "490";
        sliceLable.style['color'] = "white";
        sliceLable.style['font-size'] = "16px";
        sliceLable.style['user-select'] = "none";
        sliceLable.style['float'] = "right";

        var sliceText = document.createElement("input");
        sliceText.type = sliceText.className = "text";
        sliceText.value = this.slice ? this.slice : "";
        sliceText.style['zIndex'] = "490";
        sliceText.style['font-size'] = "16px";
        sliceText.style['float'] = "right";

        function sliceTextKeyDown(e) {
            if (isNaN(this.sliceText.value) || this.sliceText.value > 30 || this.sliceText.value < 0) {
                this.sliceText.value = this.cube.slice;
            }
            else {
                this.cube.slice = parseInt(Math.abs(this.sliceText.value));
                this.sliceText.value = this.cube.slice; //abs and in
                this.cube.resetX();
                this.cube.resetY();
                this.cube.reflesh();
            }
        }

        sliceTextKeyDown = sliceTextKeyDown.bind({ cube: this, sliceText: sliceText });
        sliceText.addEventListener("change", sliceTextKeyDown, false);

        userDIV.appendChild(sliceLable);
        userDIV.appendChild(sliceText);

        //////////WindowLevel//////////

        var WCLable = document.createElement("LABEL");
        var WWLable = document.createElement("LABEL");
        WCLable.innerText = "Windtow Center";
        WWLable.innerText = "Window Width";
        WCLable.style['zIndex'] = WWLable.style['zIndex'] = "490";
        WCLable.style['color'] = WWLable.style['color'] = "white";
        WCLable.style['font-size'] = WWLable.style['font-size'] = "16px";
        WCLable.style['user-select'] = WWLable.style['user-select'] = "none";
        WCLable.style['float'] = WWLable.style['float'] = "right";

        var WCText = document.createElement("input");
        var WWText = document.createElement("input");
        WCText.type = WCText.className = WWText.type = WWText.className = "text";
        WCText.value = this.windowCenter ? this.windowCenter : "";
        WWText.value = this.windowWidth ? this.windowWidth : "";
        WCText.style['zIndex'] = WWText.style['zIndex'] = "490";
        WCText.style['font-size'] = WWText.style['font-size'] = "16px";
        WCText.style['float'] = WWText.style['float'] = "right";
        this.WWText = WWText;
        this.WCText = WCText;

        function WCTextKeyDown(e) {
            if (isNaN(this.WCText.value)) {
                this.WCText.value = this.cube.windowCenter;
            }
            else {
                this.cube.windowCenter = parseInt(Math.abs(this.WCText.value));
                this.WCText.value = this.cube.windowCenter; //abs and in
                this.cube.resetZ();
                this.cube.resetX();
                this.cube.resetY();
                this.cube.reflesh();
            }
        }

        function WWTextKeyDown(e) {
            if (isNaN(this.WWText.value)) {
                this.WWText.value = this.cube.windowWidth;
            }
            else {
                this.cube.windowWidth = parseInt(Math.abs(this.WWText.value));
                this.WWText.value = this.cube.windowWidth; //abs and in
                this.cube.resetZ();
                this.cube.resetX();
                this.cube.resetY();
                this.cube.reflesh();
            }
        }

        WCTextKeyDown = WCTextKeyDown.bind({ cube: this, WCText: WCText });
        WWTextKeyDown = WWTextKeyDown.bind({ cube: this, WWText: WWText });
        WCText.addEventListener("change", WCTextKeyDown, false);
        WWText.addEventListener("change", WWTextKeyDown, false);

        userDIV.appendChild(WCLable);
        userDIV.appendChild(WCText);
        userDIV.appendChild(WWLable);
        userDIV.appendChild(WWText);

        //////////Reduce resolution//////////

        var resolutionLable = document.createElement("LABEL");
        resolutionLable.innerText = "Reduce resolution";
        resolutionLable.style['zIndex'] = "490";
        resolutionLable.style['color'] = "white";
        resolutionLable.style['font-size'] = "16px";
        resolutionLable.style['user-select'] = "none";
        resolutionLable.style['float'] = "right";
        userDIV.appendChild(resolutionLable);
        var resolutionSelect = document.createElement("select");
        resolutionSelect.style = "z-index: 490;font-weight:bold;font-size:16px";
        var option = document.createElement("option");
        option.innerText = "1";
        option.setAttribute("value", 1);
        option.setAttribute("selected", "selected");
        resolutionSelect.appendChild(option);
        for (var i = 0; i < this.stepFactor.length; i++) {
            if (this.stepFactor[i] > 1 && this.stepFactor[i] <= this.width / 8) {
                option = document.createElement("option");
                option.innerText = this.stepFactor[i];
                option.setAttribute("value", this.stepFactor[i]);
                resolutionSelect.appendChild(option);
            }
        }
        userDIV.appendChild(resolutionSelect);
        function ChangeResolution() {
            this.cube.step = parseInt(this.resolutionSelect.options[this.resolutionSelect.options.selectedIndex].value);
            this.cube.resetZ();
            this.cube.resetX();
            this.cube.resetY();
            this.cube.reflesh();
        }

        ChangeResolution = ChangeResolution.bind({ cube: this, resolutionSelect: resolutionSelect });
        resolutionSelect.addEventListener("change", ChangeResolution, false);
        //////////LUT//////////

        var lutLable = document.createElement("LABEL");
        lutLable.innerText = "LUT";
        lutLable.style['zIndex'] = "490";
        lutLable.style['color'] = "white";
        lutLable.style['font-size'] = "16px";
        lutLable.style['user-select'] = "none";
        lutLable.style['float'] = "right";
        userDIV.appendChild(lutLable);

        var lutSelect = document.createElement("select");
        lutSelect.style = "z-index: 490;font-weight:bold;font-size:16px";
        var option = document.createElement("option");
        option.innerText = "default";
        option.setAttribute("selected", "selected");
        option.setAttribute("value", "default");
        lutSelect.appendChild(option);
        for (var i = 0; i < VR2_LutArray.length; i++) {
            option = document.createElement("option");
            option.innerText = VR2_LutArray[i].name;
            option.setAttribute("value", VR2_LutArray[i].name);
            lutSelect.appendChild(option);
        }

        userDIV.appendChild(lutSelect);
        function ChangeLut() {
            this.cube.lut = this.lutSelect.options[this.lutSelect.options.selectedIndex].value;
            this.cube.resetZ();
            this.cube.resetX();
            this.cube.resetY();
            this.cube.reflesh();
        }

        ChangeLut = ChangeLut.bind({ cube: this, lutSelect: lutSelect });
        lutSelect.addEventListener("change", ChangeLut, false);


        //////////Shadow//////////
        var span = document.createElement("span");
        span.style['zIndex'] = "490";
        span.style['float'] = "right";
        var ShadowLable = document.createElement("LABEL");
        ShadowLable.innerText = "Shadow";
        ShadowLable.style['zIndex'] = "490";
        ShadowLable.style['color'] = "white";
        ShadowLable.style['font-size'] = "16px";
        ShadowLable.style['user-select'] = "none";
        ShadowLable.style['float'] = "left";

        var ShadowCheck = document.createElement("input");
        ShadowCheck.style = "z-index: 490;float:left";
        ShadowCheck.type = "checkbox";
        //ShadowCheck.setAttribute("checked", "checked");
        this.ShadowCheck = ShadowCheck;

        function ChangeShadow() {
            if (this.ShadowCheck.checked) {
                for (elem of this.cube.ElemXs) {
                    elem.classList.add("VRshadow");
                }
                for (elem of this.cube.ElemYs) {
                    elem.classList.add("VRshadow");
                }
                for (elem of this.cube.ElemZs) {
                    elem.classList.add("VRshadow");
                }
            } else {
                for (elem of this.cube.ElemXs) {
                    elem.classList.remove("VRshadow");
                }
                for (elem of this.cube.ElemYs) {
                    elem.classList.remove("VRshadow");
                }
                for (elem of this.cube.ElemZs) {
                    elem.classList.remove("VRshadow");
                }
            }
        }

        ChangeShadow = ChangeShadow.bind({ cube: this, ShadowCheck: ShadowCheck });
        ShadowCheck.addEventListener("change", ChangeShadow, false);


        span.appendChild(ShadowCheck);
        span.appendChild(ShadowLable);
        userDIV.appendChild(span);
    }

    build() {
        this.clear();
        this.buildContainer();
        this.buildInputer();
        this.buildZ();
        this.ReArrangeZ();
        this.buildX();
        this.buildY();
    }

    Render2Canvas(canvas, intercept, slope, color, step) {
        var ctx = canvas.getContext("2d"), pixelData = canvas.pixelData;
        var imgData = ctx.createImageData(canvas.width, canvas.height);
        //預先填充不透明度為255
        canvas.imgData = new Uint32Array(imgData.data.buffer).fill(0xFF0000FF);

        var high = this.windowCenter + (this.windowWidth / 2), low = this.windowCenter - (this.windowWidth / 2);
        var intercept = (intercept == undefined || intercept == null) ? 0 : intercept;
        var slope = (slope == undefined || slope == null) ? 1 : slope;

        const multiplication = 255 / ((high - low)) * slope;
        const addition = (- low + intercept) / (high - low) * 255;
        const data = imgData.data;
        if (color == true) {
            for (var i = data.length - 4; i >= 0; i -= 4) {
                data[i + 0] = pixelData[i] * multiplication + addition;
                data[i + 1] = pixelData[i + 1] * multiplication + addition;
                data[i + 2] = pixelData[i + 2] * multiplication + addition;
            }
        } else {
            //沒壓縮
            if (step == 1) {
                for (var i = 0, j = 0; i < data.length, j < pixelData.length; i += 4, j++) {
                    data[i + 0] = data[i + 1] = data[i + 2] = pixelData[j] * multiplication + addition;
                    if (data[i + 0] == 0) data[i + 3] = 0;
                }
            }
            //有壓縮
            else {
                for (var i = 0, j = 0; i < data.length, j < pixelData.length; i += 4, j += step) {
                    data[i + 0] = data[i + 1] = data[i + 2] = pixelData[j] * multiplication + addition;
                    if (data[i + 0] == 0) data[i + 3] = 0;
                    if (j % (canvas.width * step) == 0) j += (step - 1) * canvas.width * step;
                }
            }
        }

        if (this.lut != "default") {
            if (VR2_LutArray[0]) {
                var lut = null;
                for (var lutobj of VR2_LutArray) if (lutobj.name == this.lut) lut = lutobj;
                if (lut) {
                    var data_ = canvas.imgData;
                    var arr = lut.array;
                    for (var i = 0, i4 = 0; i < data_.length; i++, i4 += 4) {
                        data_[i] = arr[data[i4]];
                    }
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);
    }

    buildZ() {
        var step = this.step;

        for (var ll = 0; ll < this.sopList.length; ll++) {
            try {
                var SOP = this.sopList[ll], NewCanvas = document.createElement("CANVAS");
                NewCanvas.className = "VrCanvas VRshadow";

                //講求效能的預覽模式不要放影子
                if (!this.ShadowCheck.checked || (VRCube.operate_mode == "window" && this.MouseDownCheck == true)) NewCanvas.className = "VrCanvas";

                NewCanvas.style.position = "absolute";
                //[NewCanvas.style.width, NewCanvas.style.height] = [SOP.image.width + "px", SOP.image.height + "px"]

                [NewCanvas.width, NewCanvas.height] = [SOP.image.width, SOP.image.height];
                if (this.rescaleMode == "resize" && step != 1) {
                    [NewCanvas.width, NewCanvas.height] = [SOP.image.width / step, SOP.image.height / step];
                    /////[NewCanvas.style.width, NewCanvas.style.height] = [SOP.image.width + "px", SOP.image.height + "px"]
                }//else[NewCanvas.width, NewCanvas.height] = [SOP.image.width / step, SOP.image.height / step];

                NewCanvas.pixelData = SOP.pixelData;
                NewCanvas.windowCenter = this.windowCenter;
                NewCanvas.windowWidth = this.windowWidth;

                this.Render2Canvas(NewCanvas, SOP.image.intercept, SOP.image.slope, SOP.image.color, step);

                NewCanvas.position = new Point3D(0, 0, 0);
                NewCanvas.position.z = parseFloat(SOP.image.data.string(Tag.ImagePositionPatient).split("\\")[2]) * (1 / (parseFloat(SOP.image.rowPixelSpacing)));
                //if (this.rescaleMode == "resize" && step != 1) NewCanvas.position.z /= step;

                NewCanvas.style.transform = `rotate3d(0, 0, 0 , 0deg) translateZ(-` + (NewCanvas.position.z / this.step) + "px)";
                this.container.appendChild(NewCanvas);
                this.ElemZs.push(NewCanvas);
            } catch (ex) { };
        }
        this.ElemZs = soryByTwoKey(this.ElemZs, "position", "z");
    }

    getElemZByPosZ(num) {
        var distance = Number.MAX_VALUE;
        var BeforeElem = null;
        var elem = null;
        for (var obj of this.ElemZs) {
            if (Math.abs(obj.position.z - num) < distance) {
                distance = Math.abs(obj.position.z - num);
                elem = obj;
            }
        }
        BeforeElem = elem;
        var BeforeDistance = distance;
        var distance = Number.MAX_VALUE;
        var AfterElem = null;
        elem = null;
        if (obj.position.z - num > 0) {
            for (var obj of this.ElemZs) {
                if (Math.abs(obj.position.z - num) < distance && obj.position.z - num < 0) {
                    distance = Math.abs(obj.position.z - num);
                    elem = obj;
                }
            }
        } else if (obj.position.z - num < 0) {
            for (var obj of this.ElemZs) {
                if (Math.abs(obj.position.z - num) < distance && obj.position.z - num > 0) {
                    distance = Math.abs(obj.position.z - num);
                    elem = obj;
                }
            }
        } else {
            distance = BeforeDistance;
        }
        AfterElem = elem;
        if (AfterElem == null) AfterElem = elem;
        var AfterDistance = distance;

        BeforeDistance = Math.abs(BeforeDistance);
        AfterDistance = Math.abs(AfterDistance);
        var Distance = BeforeDistance + AfterDistance;
        return {
            BeforeElem: BeforeElem, AfterElem: AfterElem,
            BeforeDistance: BeforeDistance / Distance, AfterDistance: AfterDistance / Distance
        };
    }


    buildX() {
        for (var i = 0; i < this.slice; i++) {
            try {
                var NewCanvas = document.createElement("CANVAS");
                NewCanvas.className = "VrCanvas VRshadow";
                //講求效能的預覽模式不要放影子
                if (!this.ShadowCheck.checked || (VRCube.operate_mode == "window" && this.MouseDownCheck == true)) NewCanvas.className = "VrCanvas";

                NewCanvas.style.position = "absolute";
                NewCanvas.width = parseInt(this.deep);
                NewCanvas.height = this.height;


                if (this.rescaleMode == "resize" && this.step != 1) {
                    NewCanvas.height = this.height / this.step;
                    ////NewCanvas.style.height = this.height + "px";
                    ////NewCanvas.style.width = parseInt(this.deep) + "px";
                }
                //NewCanvas.style.width = NewCanvas.width + "px";
                //NewCanvas.style.height = NewCanvas.height + "px";

                var ctx = NewCanvas.getContext("2d");
                var imgData = ctx.createImageData(NewCanvas.width, NewCanvas.height);
                new Uint32Array(imgData.data.buffer).fill(0x00000000);
                var data = imgData.data;

                ctx.putImageData(imgData, 0, 0);
                var pos_x = (0 + this.width * (i / this.slice));
                const deep = parseInt(this.deep);

                for (var d = 0; d < deep; d++) {
                    //var originData = ctx.getImageData(d, 0, 1, NewCanvas.height);
                    var TwicheElemZ = this.getElemZByPosZ((deep - d) * this.pixelSpacing);
                    //var TargetData = elemZ.getContext('2d').getImageData(parseInt(pos_x), 0, 1, elemZ.height)
                    //for (var f = 0; f < originData.data.length; f++) originData.data[f] = TargetData.data[f];
                    ctx.globalAlpha = TwicheElemZ.AfterDistance;
                    ctx.drawImage(TwicheElemZ.BeforeElem, parseInt(pos_x / this.step), 0, 1, TwicheElemZ.BeforeElem.height, d, 0, 1, NewCanvas.height);
                    ctx.globalAlpha = TwicheElemZ.BeforeDistance;
                    ctx.drawImage(TwicheElemZ.AfterElem, parseInt(pos_x / this.step), 0, 1, TwicheElemZ.AfterElem.height, d, 0, 1, NewCanvas.height);
                    ctx.globalAlpha = 1;
                    //ctx.putImageData(TargetData, d, 0);
                }

                NewCanvas.position = new Point3D(0, 0, 0);
                NewCanvas.position.x = pos_x;
                NewCanvas.style.transform = `rotateY(90deg) translateZ(` + ((NewCanvas.position.x - this.width / 2) / this.step) + "px)";
                this.container.appendChild(NewCanvas);
                this.ElemXs.push(NewCanvas);
            } catch (ex) { };
        }
    }

    buildY() {
        for (var i = 0; i < this.slice; i++) {
            try {
                var NewCanvas = document.createElement("CANVAS");
                NewCanvas.className = "VrCanvas VRshadow";

                //講求效能的預覽模式不要放影子
                if (!this.ShadowCheck.checked || (VRCube.operate_mode == "window" && this.MouseDownCheck == true)) NewCanvas.className = "VrCanvas";

                NewCanvas.style.position = "absolute";

                NewCanvas.width = this.width;
                NewCanvas.height = parseInt(this.deep);

                if (this.rescaleMode == "resize" && this.step != 1) {
                    NewCanvas.width = this.width / this.step;
                    /////NewCanvas.style.width = this.width + "px";
                    /////NewCanvas.style.height = parseInt(this.deep) + "px";
                }

                //NewCanvas.pixelData = this.ElemZs[0].pixelData;
                var ctx = NewCanvas.getContext("2d");
                var imgData = ctx.createImageData(NewCanvas.width, NewCanvas.height);
                new Uint32Array(imgData.data.buffer).fill(0x00000000);
                var data = imgData.data;

                ctx.putImageData(imgData, 0, 0);

                var pos_y = (0 + this.height * (i / this.slice));
                const deep = parseInt(this.deep);

                for (var d = 0; d < deep; d++) {
                    //var originData = ctx.getImageData(0, d, NewCanvas.width, 1);
                    var TwicheElemZ = this.getElemZByPosZ(d * this.pixelSpacing);
                    //var TargetData = elemZ.getContext('2d').getImageData(0, parseInt(pos_y), elemZ.width, 1);
                    //for (var f = 0; f < originData.data.length; f++)  originData.data[f] = TargetData.data[f];;
                    ctx.globalAlpha = TwicheElemZ.AfterDistance;
                    ctx.drawImage(TwicheElemZ.BeforeElem, 0, parseInt(pos_y / this.step), TwicheElemZ.BeforeElem.width, 1, 0, d, NewCanvas.width, 1);
                    ctx.globalAlpha = TwicheElemZ.BeforeDistance;
                    ctx.drawImage(TwicheElemZ.AfterElem, 0, parseInt(pos_y / this.step), TwicheElemZ.AfterElem.width, 1, 0, d, NewCanvas.width, 1);
                    ctx.globalAlpha = 1;
                    //ctx.putImageData(TargetData, 0, d);
                }

                var offsety = (this.height / 1 / 2) - (this.height / this.step / 2);
                NewCanvas.position = new Point3D(0, 0, 0);
                NewCanvas.position.y = -pos_y;//+ offsety;
                NewCanvas.style.transform = `rotateX(90deg) translateZ(` + (((NewCanvas.position.y / this.step + (this.deep) / 2))) + "px)";
                this.container.appendChild(NewCanvas);
                this.ElemYs.push(NewCanvas);
            } catch (ex) { };
        }
    }

    GetMinByElemZ() {
        var MinZ = Number.MAX_VALUE;
        var thicknessList = [];
        for (var obj of this.ElemZs) {
            thicknessList.push(obj.thickness);
            if (obj.position.z < MinZ) MinZ = obj.position.z;
        }
        return MinZ;
    }

    GetMaxByElemZ() {
        var MaxZ = Number.MIN_VALUE;
        var thicknessList = [];
        for (var obj of this.ElemZs) {
            thicknessList.push(obj.position.z);
            if (obj.position.z > MaxZ) MaxZ = obj.position.z;
        }
        return MaxZ;
    }

    GeMediumByElemZ() {
        let getMedium = arr => {
            let len = arr.length;
            arr = arr.sort((a, b) => a - b);
            if (len % 2 === 0) return (arr[len / 2] + arr[len / 2 - 1]) / 2;
            else return arr[(len - 1) / 2];
        }
        var thicknessList = [];
        for (var obj of this.ElemZs)
            thicknessList.push(obj.position.z);
        return getMedium(thicknessList);
    }

    ReArrangeZ() {
        var CenterZ = this.GeMediumByElemZ();
        for (var obj of this.ElemZs) {
            obj.position.z = obj.position.z - CenterZ;
            obj.style.transform = `rotate3d(0, 0, 0 , 0deg) translateZ(` + (obj.position.z / this.step) + "px)";
        }
        this.deep = (this.GetMaxByElemZ() - this.GetMinByElemZ()) / this.step;
    }
}


function initVR2() {
    if (BL_mode == 'VR2') {
        set_BL_model.onchange = function () {
            displayMark();
            set_BL_model.onchange = function () { return 0; };
        }

        BlueLightMousedownList = [];
        BlueLightMousemoveList = [];
        BlueLightMouseupList = [];
        displayVR2();
        VRCube.operate_mode = "move";
        drawBorder(getByid("moveVR2"));

        var cube = new VRCube(GetViewport().sop);
        cube.build();
    }
}
