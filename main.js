// =====================================
// HIGHWAY RUSH 3D
// STEP 1
// =====================================

let scene;
let camera;
let renderer;

let road;
let car;

let speed = 0;
let coins = 0;


// =====================================
// START GAME
// =====================================

function init() {

    // Scene
    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x87ceeb);


    // Camera
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    camera.position.set(0, 2.2, 6);

    camera.lookAt(0, 1, 0);


    // Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 2)
    );

    document
        .getElementById("game")
        .appendChild(renderer.domElement);


    // =================================
    // LIGHT
    // =================================

    const ambientLight = new THREE.AmbientLight(
        0xffffff,
        1.5
    );

    scene.add(ambientLight);


    const sun = new THREE.DirectionalLight(
        0xffffff,
        2
    );

    sun.position.set(
        10,
        20,
        10
    );

    scene.add(sun);


    // =================================
    // ROAD
    // =================================

    const roadGeometry =
        new THREE.PlaneGeometry(
            12,
            500
        );

    const roadMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x333333
        });

    road = new THREE.Mesh(
        roadGeometry,
        roadMaterial
    );

    road.rotation.x = -Math.PI / 2;

    road.position.y = 0;

    road.position.z = -200;

    scene.add(road);


    // =================================
    // GRASS
    // =================================

    const grassGeometry =
        new THREE.PlaneGeometry(
            100,
            500
        );

    const grassMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x238b45
        });

    const grass = new THREE.Mesh(
        grassGeometry,
        grassMaterial
    );

    grass.rotation.x = -Math.PI / 2;

    grass.position.y = -0.02;

    grass.position.z = -200;

    scene.add(grass);


    // =================================
    // ROAD CENTER LINE
    // =================================

    for (let i = 0; i < 100; i++) {

        const lineGeometry =
            new THREE.BoxGeometry(
                0.15,
                0.02,
                3
            );

        const lineMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            });

        const line =
            new THREE.Mesh(
                lineGeometry,
                lineMaterial
            );

        line.position.set(
            0,
            0.03,
            -i * 5
        );

        scene.add(line);
    }


    // =================================
    // PLAYER CAR
    // =================================

    const carBodyGeometry =
        new THREE.BoxGeometry(
            1.8,
            0.6,
            3.5
        );

    const carBodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xff2020
        });

    car = new THREE.Mesh(
        carBodyGeometry,
        carBodyMaterial
    );

    car.position.set(
        0,
        0.45,
        3
    );

    scene.add(car);


    // =================================
    // CAR ROOF
    // =================================

    const roofGeometry =
        new THREE.BoxGeometry(
            1.4,
            0.5,
            1.6
        );

    const roofMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x222222
        });

    const roof =
        new THREE.Mesh(
            roofGeometry,
            roofMaterial
        );

    roof.position.set(
        0,
        1,
        3
    );

    scene.add(roof);


    // =================================
    // CAMERA
    // =================================

    camera.position.set(
        0,
        2,
        6
    );

    camera.lookAt(
        0,
        0.8,
        -10
    );


    // =================================
    // RESIZE
    // =================================

    window.addEventListener(
        "resize",
        resize
    );


    // Hide loading screen

    setTimeout(() => {

        document.getElementById(
            "loading"
        ).style.display = "none";

    }, 1000);


    // Start animation

    animate();
}


// =====================================
// RESIZE
// =====================================

function resize() {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
}


// =====================================
// GAME LOOP
// =====================================

function animate() {

    requestAnimationFrame(
        animate
    );


    // धीरे-धीरे speed बढ़ेगी
    speed += 0.01;

    if (speed > 120) {
        speed = 120;
    }


    // HUD update

    document.getElementById(
        "speed"
    ).textContent =
        Math.floor(speed);


    document.getElementById(
        "coins"
    ).textContent =
        coins;


    // Camera follows car

    camera.position.x =
        car.position.x;

    camera.lookAt(
        car.position.x,
        0.8,
        -20
    );


    // Render

    renderer.render(
        scene,
        camera
    );
}


// =====================================
// START
// =====================================

init();