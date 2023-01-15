import * as THREE from 'three';
import * as THREEx from 'arMarker';
import createTorusKnot from './three/three-torusKnot';
import {OrbitControls} from "./three/addons/OrbitControls";
import {TransformControls} from "./three/addons/TransformControls";

THREEx.ArToolkitContext.baseURL = 'assets/';
const loader = new THREE.GLTFLoader();

const initArMarker = (mode = 'production') => {
    //////////////////////////////////////////////////////////////////////////////////
    //    Init
    //////////////////////////////////////////////////////////////////////////////////

    // init renderer

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        autoResize: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild(renderer.domElement);


    // init scene and camera
    var scene = new THREE.Scene();

    // array of functions for the rendering loop
    scene.animationQueue = [];

    //////////////////////////////////////////////////////////////////////////////////
    //    Initialize a basic camera
    //////////////////////////////////////////////////////////////////////////////////

    // Create a camera
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // const light = new THREE.AmbientLight( 0x999999 ); // soft white light
    // scene.add( light );

    camera.position.z=0;
    camera.lookAt(scene.position);


    const controls = new OrbitControls( camera, renderer.domElement );
    animate();


    // START Transform Controls

    const transformControls = new TransformControls(camera, renderer.domElement)
    scene.add(transformControls)
    transformControls.addEventListener('mouseDown', function () {
        controls.enabled = false
    })
    transformControls.addEventListener('mouseUp', function () {
        controls.enabled = true
    })

    window.addEventListener('keydown', function (event) {
        switch (event.key) {
            case 'g':
                transformControls.setMode('translate')
                break
            case 'r':
                transformControls.setMode('rotate')
                break
            case 's':
                transformControls.setMode('scale')
                break
        }
    })

    // END Transform Controls




    function animate() {
        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();
        renderer.render( scene, camera );
    }
    renderer.setAnimationLoop(animate);


    ////////////////////////////////////////////////////////////////////////////////
    //          handle arToolkitSource
    ////////////////////////////////////////////////////////////////////////////////

    // prepare source type depending simulation/production mode
    const sourceType = {};
    if (mode === 'simulation') {
        sourceType.sourceType = 'image';
        sourceType.sourceUrl = THREEx.ArToolkitContext.baseURL + 'marker_samples.png';
    } else {
        sourceType.sourceType = 'webcam';
    }

    var arToolkitSource = new THREEx.ArToolkitSource(
        sourceType
        // {
        // to read from the webcam
        // sourceType : 'webcam',

        // // to read from an image
        // sourceType : 'image',
        // sourceUrl : THREEx.ArToolkitContext.baseURL + './marker_samples.png',

        // to read from a video
        // sourceType : 'video',
        // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',
        // }
    )

    arToolkitSource.init(function onReady() {
        setTimeout(() => {
            onResize();
        }, 1000);
        onResize();
    })

    const onResize = () => {
        arToolkitSource.onResizeElement()
        arToolkitSource.copyElementSizeTo(renderer.domElement)
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
        }
    }

    // handle resize
    window.addEventListener('resize', onResize);

    ////////////////////////////////////////////////////////////////////////////////
    //          initialize arToolkitContext
    ////////////////////////////////////////////////////////////////////////////////


    // create atToolkitContext
    var arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'camera_para.dat',
        detectionMode: 'mono_and_matrix',
    })
    // initialize it
    arToolkitContext.init(function onCompleted() {
        // copy projection matrix to camera
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    })


    // update artoolkit on every frame
    scene.animationQueue.push(function () {
        if (arToolkitSource.ready === false) return

        // console.log(arToolkitSource.domElement);
        arToolkitContext.update(arToolkitSource.domElement)

        // update scene.visible if the marker is seen
        scene.visible = camera.visible
    })

    ////////////////////////////////////////////////////////////////////////////////
    //          Create a ArMarkerControls
    ////////////////////////////////////////////////////////////////////////////////

    // init controls for camera
    var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
        type: 'pattern',
        patternUrl: THREEx.ArToolkitContext.baseURL + './marker.patt',
        // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
        // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
        changeMatrixMode: 'cameraTransformMatrix'
    })
    // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
    scene.visible = false

    //////////////////////////////////////////////////////////////////////////////////
    //    add an object in the scene
    //////////////////////////////////////////////////////////////////////////////////

    // add a torus knot
    // createTorusKnot(scene);


    loader.load('assets/3d-models/suit.glb', function (gltf) {

        const model = gltf.scene;
        model.rotation.y += 3.1;
        model.rotation.z -= 0.1;
        // model.position.z += 17;
        // model.position.y = -5
        model.position.x = -0.5;
        model.position.z = +6.5;
        model.scale.set(0.08, 0.08, 0.08);


        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.target = model;
        directionalLight.castShadow = true;
        directionalLight.position.y = 10;
        directionalLight.position.z = 100;
        directionalLight.position.x = 0;
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xfafafa, 1);
        directionalLight2.target = model;
        directionalLight2.position.y = 5;
        directionalLight2.position.z = 8;
        directionalLight2.position.x = 1;
        scene.add(directionalLight2);

        transformControls.attach(gltf.scene)
        scene.add(gltf.scene);

    }, undefined, function (error) {

        console.error(error);

    });

    //////////////////////////////////////////////////////////////////////////////////
    //    render the whole thing on the page
    //////////////////////////////////////////////////////////////////////////////////

    // render the scene
    scene.animationQueue.push(function () {
        renderer.render(scene, camera);
    })

    // run the rendering loop
    var lastTimeMsec = null
    requestAnimationFrame(function animate(nowMsec) {
        // keep looping
        requestAnimationFrame(animate);
        // measure time
        lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60
        var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
        lastTimeMsec = nowMsec
        // call each update function
        scene.animationQueue.forEach(function (onRenderFct) {
            onRenderFct(deltaMsec / 1000, nowMsec / 1000)
        })
    })
}

export default initArMarker;