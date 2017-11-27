var container;
var count = 0;
var camera, scene, renderer, particles, i, h, color;
var shaderMaterial, metalMaterial;
var mouseX = 0, mouseY = 0;
var mandelbrot;
var clock;
var textMesh;
var logoMesh;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var color1 = new THREE.Color(0, 140 / 255, 186 / 255);
var color2 = new THREE.Color(1, 1, 0.2);
var color3 = new THREE.Vector3(0.0, 0.0, 0.0);

init();
animate();

function init() {
  THREE.ImageUtils.crossOrigin = '';
  container = document.createElement('div');
  container.id = 'fullscreen';
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  scene = new THREE.Scene();
  //scene.fog = new THREE.Fog(new THREE.Color(0.1, 0.1, 0.1), 1000, 9000);
  //scene.background = new THREE.Color(0.1, 0.1, 0.1);

  clock = new THREE.Clock();
  clock.start();

  uniforms = {
    texture: { type: "t", value: THREE.ImageUtils.loadTexture('sphere.png') },
    uColor1: { type: "3f", value: new THREE.Vector3(0, 0, 0) },
    uColor2: { type: "3f", value: new THREE.Vector3(0, 0, 0) },
    uColor3: { type: "3f", value: new THREE.Vector3(0, 0, 0) },
    uConstant: { type: "2f", value: new THREE.Vector2(0, 0) },
    uZoom: { type: "1f", value: 0.0 },
    uScaler: { type: "1f", value: 0.0 }
  };

  shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent
  });

  var plane = new THREE.Mesh(new THREE.PlaneGeometry(4096, 4096, 32), shaderMaterial);
  plane.rotation.x = -Math.PI * 0.5;
  plane.position.y = -1000;
  scene.add(plane);
  mandelbrot = plane;

  var baseColor = new THREE.Color(0, 140 / 255, 186 / 255);
  var whiteColor = new THREE.Color(0.9, 0.9, 0.9);
  metalMaterial = new THREE.MeshStandardMaterial({
    color: whiteColor,
    emissive: baseColor,
    emissiveIntensity: 0.1,
    //envMap: cubeCamera2.renderTarget.texture,
    //envMap: reflectionCube,
    metalness: 0.1,
    roughness: 0
  });

  var objLoader = new THREE.OBJLoader();

  objLoader.load(
    'nitor.obj',
    function (object) {
      object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = metalMaterial;
        }
      });
      object.rotation.x = Math.PI;
      object.rotation.z = Math.PI;
      logoMesh = object;
      scene.add(object);
    });

  var ambientlight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientlight);

  var pointLight = new THREE.PointLight(0xe0f0ff, 2.0, 10000);
  pointLight.position.set(0, 200, 200);
  scene.add(pointLight);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  //renderer.autoClear = false;
  //renderer.setFaceCulling(THREE.CullFaceNone);
  container.appendChild(renderer.domElement);

  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);
  window.addEventListener('resize', onWindowResize, false);
}

function onDocumentMouseDown(event) {
  var target = document.getElementById('fullscreen');
  var requestFullscreen = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen;
  if (event.button === 2) {
    requestFullscreen.call(target);
  }
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function goFullscreen(event) {
  var target = document.getElementById('fullscreen');
  var requestFullscreen = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen;
  requestFullscreen.call(target);
  if (event) event.preventDefault();
}

function onDocumentTouchStart(event) {
  var target = document.getElementById('fullscreen');
  var requestFullscreen = target.requestFullscreen || target.webkitRequestFullscreen || target.mozRequestFullScreen;
  if (event.touches.length == 2) {
    requestFullscreen.call(target);
  } else if (event.touches.length === 1) {
    event.preventDefault();
    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

function onDocumentTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault();
    mouseX = event.touches[0].pageX - windowHalfX;
    mouseY = event.touches[0].pageY - windowHalfY;
  }
}

function onWindowResize(event) {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  var t = clock.getElapsedTime();

  var a = 0.0;//2 * mouseX / windowHalfX;
  var b = 0.0;//2 * mouseY / windowHalfY;
  var x = 0.0;
  var y = 500;
  var z = 1000 * b;

  camera.position.x = x * Math.cos(a) - y * Math.sin(a);
  camera.position.y = - x * Math.sin(a) + y * Math.cos(a);
  camera.position.z = z;

  camera.lookAt(scene.position);
  camera.rotation.order = 'XYZ';
  camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), a / 10.0);
  camera.up = new THREE.Vector3(0, 0, 1);

  ++count;

  render();
}

function render() {
  var t = clock.getElapsedTime();

  var speed = 0.1;
  mandelbrot.position.x = Math.sin(2.0 * speed * t) * 256.0;
  mandelbrot.position.z = Math.cos(2.0 * speed * t) * 256.0;
  mandelbrot.rotation.z = (speed * 0.1 * t) % (Math.PI * 2.0);
  //console.log(shaderMaterial.uniforms.uColor1.value);
  shaderMaterial.uniforms.uColor1.value = color1;
  shaderMaterial.uniforms.uColor2.value = color2;
  shaderMaterial.uniforms.uColor3.value = color3;
  var scaler = Math.sin(t * 0.1 * speed) * Math.sin(t * 0.1 * speed);
  shaderMaterial.uniforms.uConstant.value = new THREE.Vector2(0.1 * Math.cos(3.3 * speed * t) + 0.5 * Math.cos(6.3 * speed * t),
                                                              0.1 * Math.cos(3.9 * speed * t) + 0.5 * Math.sin(5.7 * speed * t));
  shaderMaterial.uniforms.uZoom.value = 1.0 + 0.2 * Math.cos(speed * t * 0.5)
  shaderMaterial.uniforms.uScaler.value = scaler;
  //shaderMaterial.uniforms.uTime.value = t;

  renderer.render(scene, camera);
}

function initFullscreen() {
  var gofull = document.getElementById('gofull');
  if (gofull) {
    gofull.addEventListener('mousedown', goFullscreen);
    gofull.addEventListener('touchstart', goFullscreen);
  } else {
    setTimeout(initFullscreen, 500);
  }
}

initFullscreen();
