/* Web-Based-VR-Tutorial Project Template
 * Author: Evan Suma Rosenberg <suma@umn.edu> and Blair MacIntyre <blair@cc.gatech.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * 
 * Sample adapted from https://playground.babylonjs.com/#TAFSN0#323
 */ 

import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { Logger } from "@babylonjs/core/Misc/logger";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { StackPanel } from "@babylonjs/gui/2D/controls/stackPanel";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";
import { Control } from "@babylonjs/gui/2D/controls/control";
import { ColorPicker } from "@babylonjs/gui/2D/controls/colorpicker";
import {StandardMaterial} from "@babylonjs/core/Materials/standardMaterial"

// Side effects
import "@babylonjs/core/Helpers/sceneHelpers";

// WebXR stuff
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { WebXRFeatureName, WebXRFeaturesManager } from "@babylonjs/core/XR/webXRFeaturesManager";
import { WebXRMotionControllerManager } from "@babylonjs/core/XR/motionController/webXRMotionControllerManager";

// add this to import the controller models from the online repository
import "@babylonjs/loaders"

// More necessary side effects
import "@babylonjs/core/Materials/standardMaterial"
import "@babylonjs/inspector";

class Game 
{ 
    private canvas: HTMLCanvasElement;
    private engine: Engine;
    private scene: Scene;

    constructor()
    {
        // Get the canvas element 
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

        // Generate the BABYLON 3D engine
        this.engine = new Engine(this.canvas, true); 

        // Creates a basic Babylon Scene object
        this.scene = new Scene(this.engine);   

    }

    start() : void 
    {
        // Create the scene and then execute this function afterwards
        this.createScene().then(() => {

            // Register a render loop to repeatedly render the scene
            this.engine.runRenderLoop(() => { 
                this.update();
                this.scene.render();
            });

            // Watch for browser/canvas resize events
            window.addEventListener("resize", () => { 
                this.engine.resize();
            });
        });
    }

    private async createScene() 
    {
        // Create an IcoSphere
        var sphere = MeshBuilder.CreateIcoSphere("sphere", 
                           {radius:0.2, flat:true, subdivisions: 1}, this.scene);
        sphere.position.y = 3;
        sphere.material = new StandardMaterial("sphere material", this.scene)
    
        // Light
        var light = new DirectionalLight("light", new Vector3(0, -0.5, 1.0), this.scene);
        light.position = new Vector3(0, 5, -2);

        // Camera
        var camera = new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 4, 3, 
                                         new Vector3(0, 3, 0), this.scene);
        camera.attachControl(this.canvas, true);
        camera.beta += 0.8;
    
        // Default Environment
        var environment = this.scene.createDefaultEnvironment({ enableGroundShadow: true,    
                                                                groundYBias: 2.8 });
        environment!.setMainColor(Color3.FromHexString("#74b9ff"))
        
        // Shadows for the light created above
        var shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;
        shadowGenerator.addShadowCaster(sphere, true);
    
        // Initialize WebXR
        const xrHelper = await this.scene.createDefaultXRExperienceAsync({
                floorMeshes: [environment!.ground!]
        });
        const availableFeatures = WebXRFeaturesManager.GetAvailableFeatures();
        console.log("WebXR Features:")
        console.log(availableFeatures)

        // Runs every frame to rotate the sphere
        this.scene.onBeforeRenderObservable.add(()=>{
            sphere.rotation.y += 0.0001*this.scene.getEngine().getDeltaTime();
            sphere.rotation.x += 0.0001*this.scene.getEngine().getDeltaTime();
        })
    
        // GUI: create a 2D GUI as a dynamic texture on a plane
        var plane = MeshBuilder.CreatePlane("plane",{});
        plane.position = new Vector3(0.4, 4, 0.4)
        var advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);
        var panel = new StackPanel();    
        advancedTexture.addControl(panel);  

        // populate the panel with title and colorpicker
        var header = new TextBlock();
        header.text = "Color GUI";
        header.height = "100px";
        header.color = "white";
        header.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        header.fontSize = "120"
        panel.addControl(header); 
        
        var picker = new ColorPicker();
        picker.value = (sphere.material as StandardMaterial).diffuseColor;
        picker.horizontalAlignment =  Control.HORIZONTAL_ALIGNMENT_CENTER;
        picker.height = "350px";
        picker.width = "350px";
        picker.onValueChangedObservable.add(function(value) {
            (sphere.material as StandardMaterial).diffuseColor.copyFrom(value);
        });
        panel.addControl(picker);
    
        // Show the debug scene explorer and object inspector
        this.scene.debugLayer.show(); 
    }

    // The main update loop will be executed once per frame before the scene is rendered
    private update() : void
    {
 
    }


    colors = {
        seaFoam: Color3.FromHexString("#16a085"),
        green: Color3.FromHexString("#27ae60"),
        blue: Color3.FromHexString("#2980b9"),
        purple: Color3.FromHexString("#8e44ad"),
        navy: Color3.FromHexString("#2c3e50"),
        yellow: Color3.FromHexString("#f39c12"),
        orange: Color3.FromHexString("#d35400"),
        red: Color3.FromHexString("#c0392b"),
        white: Color3.FromHexString("#bdc3c7"),
        gray: Color3.FromHexString("#7f8c8d")
    }
}
/******* End of the Game class ******/   

// start the game
var game = new Game();
game.start();