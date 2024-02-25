<script>
    // @ts-nocheck
    
      import { onMount } from 'svelte';
      import * as THREE from 'three';
      import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
      import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
      import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
      import { CharacterControls } from '$lib/CharacterControls';
      import JsonUtil from '$lib/scene-9.json';
  
     
      
    
      let inputValue = '';
      let showOverlay = true;
      let canvas;
      let scene, camera, renderer, controls, mixer , mixer2 , mixerB ,model, deer , bear, monkey , mixerM , tiger , mixerT , tigerAnim ,zebra, mixerZ , zebraAnim, diana , mixerD  , dianaAnim;
      let bearAngle = 0;
      let modelBoundingBox = new THREE.Box3();
      let peerBoundingBox = new THREE.Box3();
      let boundingbox = [];
      let i = 3 ;
      let tram, envAnim;
      let mixerNew;
      let animationsNew;
    
      let peer;
      let board;
    

      let boxHelper1 , boxHelper2 , box3TramC1 , box3TramC2 ;
      let trainBoard;

      let sound;
      let soundLetsGo;
      let Drawboard;
      let showDrawBoard = false;

      //multiplayer
      let codeId = '';
      let yourId = null;
      let avatars = {};
      let conn ;
      let multiplayerMode = false;

      let peerModelMesh;

      let positionCursor;
      let eraseBoard = false ;



      
     

      onMount(() => {

      
        if(multiplayerMode){
              multiplayer();
        }
        scene = new THREE.Scene();
    

        // Camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 5);
    
        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        canvas = document.getElementById('three-scene');
        canvas.appendChild(renderer.domElement);
    
        // Orbit Controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.minDistance = 0.5;
        controls.maxDistance = 4;
    
       
        
        let hdrUrl = toggle ? "/pic2.hdr" : "/night.hdr";
   new RGBELoader().load(hdrUrl, 
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error('An error occurred while loading the HDR texture.', error);
  }
);

    
        //collisionboxes
        addCollisionBoxes(JsonUtil,scene);
    
    
        //Avatar
        let characterControls;
        const loader2 = new GLTFLoader();
        loader2.load("./avatar.glb", (gltf) => {
           model = gltf.scene;
      
          model.position.set(0, 0.7, 2);
          model.scale.set(0.4, 0.4, 0.4);
          scene.add(model);
          modelBoundingBox.setFromObject(model);
          const bboxSize = new THREE.Vector3();
          modelBoundingBox.getSize(bboxSize);
          let clips = gltf.animations;
          mixer = new THREE.AnimationMixer(model);
          const animationsMap = new Map();
          clips.forEach((a) => {
            animationsMap.set(a.name, mixer.clipAction(a));
          });
          characterControls = new CharacterControls(model, mixer, animationsMap, controls, camera, 'idle');
        });
    
        // CONTROL KEYS
        const keysPressed = {};
          document.addEventListener('keydown', (event) => {
            if(event.key === 'w'){
                keysPressed[event.key.toLowerCase()] = true;
            }
        }, false);
    
        document.addEventListener('keyup', (event) => {
            if(event.key === 'w'){
                 keysPressed[event.key.toLowerCase()] = false;
            }
        }, false);
    
       
    
    
        const loader3 = new GLTFLoader();
        loader3.load('deer_walk.glb', (gltf) => {
              deer = gltf.scene;
              scene.add(deer);
              deer.position.set(-10,0.7,-1.7);
              deer.scale.set(0.004,0.004,0.004);
              if (gltf.animations && gltf.animations.length) {
                   mixer2 = new THREE.AnimationMixer(deer);
                   mixer2.clipAction(gltf.animations[0]).play();
               }
        });



    
          Drawboard = new THREE.Mesh( new THREE.BoxGeometry(2,1,0.2),new THREE.MeshBasicMaterial({color : "00ff00"}));
           scene.add(Drawboard);
           Drawboard.name = 'draw';
           Drawboard.position.set(-1.2,1.8,-5.2);


         
      
    
        const loader4 = new GLTFLoader();
        loader4.load('bear_walk.glb', (gltf) => {
              bear = gltf.scene;
              scene.add(bear);
              bear.position.set(3,0.7,-10);
              bear.scale.set(0.02,0.02,0.02);
              bear.rotation.y = -Math.PI/2;
              if (gltf.animations && gltf.animations.length) {
                   mixerB = new THREE.AnimationMixer(bear);
                   mixerB.clipAction(gltf.animations[0]).play();
               }
        });
    
       
    
        const loader6 = new GLTFLoader();
        loader6.load('simio_monkey_dancing.glb', (gltf) => {
              monkey = gltf.scene;
              scene.add(monkey);
              monkey.position.set(0,1,-5);
              monkey.scale.set(0.006,0.006,0.006);
              if (gltf.animations && gltf.animations.length) {
                   mixerM = new THREE.AnimationMixer(monkey);
                   mixerM.clipAction(gltf.animations[0]).play();
               }
        });
    
        const loaderZ = new GLTFLoader();
        loaderZ.load('zebramotions.glb', (gltf) => {
              zebra = gltf.scene;
              zebra.name = 'zebra';
              scene.add(zebra);
              zebra.position.set(-2.5,0.7,3);
              zebra.scale.set(0.4,0.4,0.4);
              zebraAnim = gltf.animations;
              if (gltf.animations && gltf.animations.length) {
                   mixerZ = new THREE.AnimationMixer(zebra);
                   mixerZ.clipAction(gltf.animations[3]).play();
               }
        });
    
    
    
        const loader7 = new GLTFLoader();
        loader7.load('tiger.glb', (gltf) => {
              tiger = gltf.scene;
              tiger.name = 'tiger';
              scene.add(tiger);
              tiger.position.set(-6,0.8,-5);
              tiger.scale.set(0.7,0.7,0.7);
              tigerAnim = gltf.animations;
              if (gltf.animations && gltf.animations.length) {
                   mixerT = new THREE.AnimationMixer(tiger);
                   mixerT.clipAction(gltf.animations[i]).play();
               }
        });

        const loaderD = new GLTFLoader();
        loaderD.load('diana.glb', (gltf) => {
              diana = gltf.scene;
              diana.name = 'diana';
              scene.add(diana);
              diana.position.set(0,1.8,0);
              diana.scale.set(0.02,0.02,0.02);
              dianaAnim = gltf.animations;
              if (gltf.animations && gltf.animations.length) {
                   mixerD = new THREE.AnimationMixer(diana);
                   mixerD.clipAction(gltf.animations[0]).play();
               }
        });

      
       
        addPosionalAudio(camera , 'tiger.mp3' ,new THREE.Vector3(-6,0.8,-5));
        addPosionalAudio(camera , 'monkey.mp3' ,new THREE.Vector3(6,0.8,10));
        addPosionalAudio(camera , 'horse.mp3' ,new THREE.Vector3(-2.5,0.7,3));
        addPosionalAudio(camera , 'bear.mp3' ,new THREE.Vector3(3,0.7,-10));
        addPosionalAudio(camera , 'elephant.mp3' ,new THREE.Vector3(-4,0.7,6));
      
        
    
        // Model
        const loader = new GLTFLoader();
        loader.load('singapore_zoo.glb', (gltf) => {
          let env = gltf.scene;
          env.scale.set(30, 30, 30);

          scene.add(env);
          tram = env.getObjectByName('Tram');
          envAnim = gltf.animations;
          box3TramC1 = new THREE.Box3().setFromObject(tram.children[0]);
          box3TramC2 = new THREE.Box3().setFromObject(tram.children[1]);
    
          if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(env);
            gltf.animations.forEach((clip) => {
              mixer.clipAction(clip).play();
            });
          }
        });
        addAudio(camera ,showOverlay);


       setInterval(()=>{
            addAudioBird(camera);
       },12000);
    
    
    
        //extra
    
        trainBoard = new THREE.Mesh(new THREE.BoxGeometry(0.5,0.1,0.01) , new THREE.MeshStandardMaterial({color : "#ff0000"}));
         trainBoard.name = 'train-borad';
        trainBoard.position.set(1,2,-2.8);
        scene.add(trainBoard);
    
    
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 1, 0);
        directionalLight.intensity = 0.5;
        scene.add(directionalLight);
    
        canvas.addEventListener("click", function (event) {
                  raycastZebra(event);
                  raycastDrawBoard(event);
                  raycastTiger(event);
        });
    
        // Animation Loop
        const clock = new THREE.Clock();
        const animate = () => {
          requestAnimationFrame(animate);
          if (mixer) {
            mixer.update(0.01); 
          }
       
          if(mixer2 && deer){
             deer.position.x += 0.008;
             if(deer.position.x > 10){
                   deer.position.x = -10;    
             }
              mixer2.update(0.01);
          }
          if(mixerM){
               mixerM.update(0.01);
          }

      if(mixerNew){
        mixerNew.update(0.01);
       }

        
          if(mixerD && diana){
            diana.position.z += 0.05;

            if(diana.position.z > 15){
                  diana.position.z = -10;
            }
            mixerD.update(0.01);
          }
    
          if(tram){
             box3TramC1.setFromObject(tram.children[0]);
             box3TramC2.setFromObject(tram.children[1]);
    
          }


          if(trainBoard &&  tram && model){
               if(tram.children[0].position.y === 0){
                    trainBoard.material.color = new THREE.Color(0x00ff00);
               }else{
                    trainBoard.material.color = new THREE.Color(0xff0000);
               }
          }
          if(mixerT && tiger){
               mixerT.update(0.01);
          }
    
          
          if(mixerZ){
               mixerZ.update(0.01);
          }
    
          if(mixerB && bear){
                bear.position.sub( new THREE.Vector3(0, 0.7, 0));
                bear.position.applyAxisAngle(new THREE.Vector3(0, -1, 0), 0.001);
                bear.position.add(new THREE.Vector3(0, 0.7, 0));
                bear.lookAt( new THREE.Vector3(0, 0.7, 0));
                mixerB.update(0.01);
        }
          let mixerUpdateDelta = clock.getDelta();
          if (characterControls && model) {
           // console.log({positionCursor});
            characterControls.update(mixerUpdateDelta, keysPressed , modelBoundingBox ,peerBoundingBox , boundingbox , tram, box3TramC1 , box3TramC2 , conn , codeId , avatars , animationsNew, peerModelMesh , positionCursor);
          }
    
          if(showOverlay){
                soundLetsGo.setLoop(true);
          }else{
               soundLetsGo.setLoop(false);
          }
          controls.update();
          renderer.render(scene, camera);
        };
        animate();
      //  multiplayer();


        canvas.addEventListener(
			'mousemove',
			function (event) {
				onMoveCursor(event);
			},
			false,
		);
      
    
        // Resize listener
        window.addEventListener('resize', onWindowResize);
    
        return () => {
          window.removeEventListener('resize', onWindowResize);
        };
      });

    
      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }

      function addAudio(camera , showOverlay){
           const listener = new THREE.AudioListener();
           camera.add(listener);

           soundLetsGo = new THREE.Audio(listener);
           const loader = new THREE.AudioLoader();
           loader.load('starting.mp3',(buffer)=>{
                 soundLetsGo.setBuffer(buffer);
                 soundLetsGo.setVolume(1);
                 soundLetsGo.play();
           });
      }
      function addAudioBird(camera){
           const listener = new THREE.AudioListener();
           camera.add(listener);

           let soundBird = new THREE.Audio(listener);
           const loader = new THREE.AudioLoader();
           loader.load('bird.mp3',(buffer)=>{
                 soundBird.setBuffer(buffer);
                 soundBird.setVolume(0.5);
                 soundBird.play();
           });
      }

      function addPosionalAudio(camera , audioPath , position){
           const listener = new THREE.AudioListener();
           camera.add(listener);
           const sound = new THREE.PositionalAudio(listener);
           const loader = new THREE.AudioLoader(); 

           loader.load(audioPath,(buffer)=>{
            sound.setBuffer(buffer);
            sound.setRefDistance(0.2); 
            sound.setLoop(true); 
            sound.setMaxDistance(0.5);
            sound.setVolume(1.5); 
            sound.play(); 
           });

        const geometry = new THREE.BoxGeometry(2, 1, 2);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 ,transparent : true , opacity : 0});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position); 
        scene.add(mesh);

        mesh.add(sound);
      }
    
      function addCollisionBoxes(JsonUtils , scene) {
            let boxes = JsonUtils.changes.Collision_Boxes;
            const geo = new THREE.BoxGeometry();
            const mat = new THREE.MeshBasicMaterial({
                color: '#00FFFF',
                opacity : 0 ,
                transparent : true
            });
            if (boxes.length > 0) {
                for (let i = 0; i < boxes.length; i++) {
                    const box = new THREE.Mesh(geo, mat);
                    box.name = 'BOUNDINGBOX' + i;
                    box.position.copy(boxes[i].transforms.position);
                    box.rotation.copy(boxes[i].transforms.rotation);
                    box.scale.copy(boxes[i].transforms.scale);
                    scene.add(box);
            let bbox = new THREE.Box3().setFromObject(box);
                    boundingbox.push(bbox);
                }
            }
        }

   
 
      function raycastTiger(event){
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          scene.children.filter((tiger) => {
            return tiger.name.includes("tiger");
          }),
          true
        );
        if (intersects.length > 0) {
          console.log({intersects});
          i = i%7 ;
          console.log({i});
          mixerT.clipAction(tigerAnim[i]).stop();
          if(i === 6){
          mixerT.clipAction(tigerAnim[0]).play();
          }else{
               mixerT.clipAction(tigerAnim[i+1]).play();
          }
        }
    
        i++;
      }
    
      function raycastZebra(event){
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          scene.children.filter((tiger) => {
            return tiger.name.includes("zebra");
          }),
          true
        );
        if (intersects.length > 0) {
          console.log({b : intersects});
          i = i%17 ;
          console.log({i});
          mixerZ.clipAction(zebraAnim[i]).stop();
          if(i === 16){
          mixerZ.clipAction(zebraAnim[0]).play();
          }else{
               mixerZ.clipAction(zebraAnim[i+1]).play();
          }
        }
    
        i++;
      }

      function raycastDrawBoard(event){
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          scene.children.filter((draw) => {
            return draw.name.includes("draw");
          }),
          true
        );
        if (intersects.length > 0) {
              showDrawBoard = !showDrawBoard;
        }
      }

      function onMoveCursor(event) {
         controls.enabled = true;
            if(showDrawBoard){
	       	const raycaster = new THREE.Raycaster();
	     	  const mouse = new THREE.Vector2();
	        mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
	        mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;
	      	raycaster.setFromCamera(mouse, camera);

         

			const intersects = raycaster.intersectObjects( scene.children.filter((draw) => {
            return draw.name.includes("draw");
          }), true);
			if (intersects.length > 0) {
         controls.enabled = false;
				positionCursor = intersects[0].point;
				const offset = 0.001;

        const geometry = new THREE.CircleGeometry( 0.07, 32 ); 
        const material = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ); 
        const cursor = new THREE.Mesh( geometry, material );
        cursor.name = "cursor";
        scene.add( cursor );

				if (cursor) {
					cursor.position.copy(positionCursor).add(new THREE.Vector3(0, offset, 0));
					const faceNormal = intersects[0].face.normal.clone();
					const cursorROtationX = Math.atan2(faceNormal.y, faceNormal.z);
					const cursorROtationY = Math.atan2(faceNormal.x, faceNormal.z);
					const cursorROtationZ = Math.atan2(faceNormal.x, faceNormal.y);
					cursor.rotation.x = cursorROtationX;
					cursor.rotation.y = cursorROtationY;
					cursor.rotation.z = cursorROtationZ;
				}
			
		}
            }
	    }

  function erase() { 
    const cursors = scene.children.filter(object => object.name === "cursor");
    cursors.forEach(cursor => scene.remove(cursor));
    eraseBoard = true;
}


      let toggle = true;
      function handleToggle(){
            window.location.reload();
             toggle = !toggle;
      }


      async function multiplayer(){
         const PeerJs = (await import('peerjs')).default;
              peer = new PeerJs();



              peer.on('call', async (call) => {
                      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                      call.answer(stream); 
                      handleCall(call);
              });

              async function initiateCall(peerId) {
                       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                       const call = peer.call(peerId, stream);
                       handleCall(call);
              }

              function handleCall(call) {
                 call.on('stream', async (remoteStream) => {
                      const listener = new THREE.AudioListener();
                      camera.add(listener);
                      const sound = new THREE.PositionalAudio(listener);

                      const context = listener.context;
                      const source = context.createMediaStreamSource(remoteStream);

                      sound.setNodeSource(source);

                      if(peerModelMesh){          
                              sound.setRefDistance(0.2); 
                              sound.setLoop(true); 
                              sound.setMaxDistance(0.5);
                              sound.setVolume(1.5); 
                              sound.play();
                              peerModelMesh.add(sound);
                      }
          })};

              peer.on('open', (id) => {
                 yourId = id;
                 console.log({id});
                 console.log('Your ID:', yourId);
             });
            
             peer.on('error', (err) => {
                 console.log('Error:', err);
             });
            peer.on('connection', (conn) => {
                 console.log('Connected to:', conn.peer);
                 if (!avatars[conn.peer]) {
                           createAvatar(conn.peer);
                           initiateCall(conn.peer);
                  }
  
                 conn.on('data', (data) => {
                     console.log('Received message:', data);
                     console.log(data.directionPressed);
                     if(data.directionPressed && !data.trainDetectPeer){
                         animationsNew.idle2.stop();
                         animationsNew.sit2.stop();
                         animationsNew.walk2.play();
                     }else if(data.trainDetectPeer && data.directionPressed && tram.children[0].position.y === 0){
                         animationsNew.idle2.stop();
                         animationsNew.sit2.stop();
                         animationsNew.walk2.play();
                     }else if(data.trainDetectPeer){ 
                         animationsNew.idle2.stop();
                         animationsNew.walk2.stop();
                         animationsNew.sit2.play();
                     }else{
                         animationsNew.idle2.play();
                         animationsNew.sit2.stop();
                         animationsNew.walk2.stop();
                     }

                     console.log({pos : data.positionCursor})
                     if(data.positionCursor){
                         createCircles(data.positionCursor);
                     }
                    
                    if(data.targetPosition){
                      avatars[conn.peer].rotation.y = Math.atan2(data.targetPosition.x -  avatars[conn.peer].position.x, data.targetPosition.z -  avatars[conn.peer].position.z)
                         let pos = data.targetPosition;
                         avatars[conn.peer].position.copy(pos);
                    }
                 });
                 
            });  
    }

    function createCircles(cursorPos){
         const geometry = new THREE.CircleGeometry( 0.07, 32 ); 
        const material = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff } ); 
        const cursor = new THREE.Mesh( geometry, material );
        cursor.position.copy(cursorPos);
        cursor.name = "cursor";
        scene.add( cursor );
    }
  
    function createAvatar(peerId) {
            const gltfLoader = new GLTFLoader();
           gltfLoader.load("/avatar.glb", async function (gltf) {
                    const newAvatar = gltf.scene;
                    newAvatar.position.set(-5, 0.8, 12);
                    newAvatar.scale.set(0.4, 0.4, 0.4);
                    newAvatar.userData.peerId = peerId;
                    avatars[peerId] = newAvatar;


                    
  
                    await scene.add(newAvatar);
                    peerBoundingBox.setFromObject(newAvatar);
                    mixerNew = new THREE.AnimationMixer(newAvatar);
                    let clips = gltf.animations;


                    peerModelMesh = new THREE.Mesh( new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color : "00ff00" , transparent : true , opacity : 0}));
                    scene.add(peerModelMesh);
                   peerModelMesh.name = 'peerModelMesh';
                    if(model){
                          peerModelMesh.position.copy(newAvatar.position);
                     }
  
                    animationsNew = {
                      idle2: mixerNew.clipAction(clips[3]),
                      walk2: mixerNew.clipAction(clips[5]),
                      sit2: mixerNew.clipAction(clips[4]),
                    };
  
                    animationsNew.idle2.play();
           });
  }
 

function connect(){
   
    conn = peer.connect(codeId);
    conn.on('open', function(){
        showOverlay = false;
    });

    conn.on('error', function(err){
        console.log(err.message);
        showOverlay = true;
    });
}


    </script>
    
    <div id="three-scene"></div>

    {#if showOverlay}
    <div class="overlay-content">
      <video autoplay loop muted class=" inset-0 w-full h-full object-cover fixed">
        <source src="zooVideo.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
  
      <div class="border border-gray-300 px-3 py-3 rounded-md  mb-28 absolute z-10">
           {#if multiplayerMode}
           {#if yourId !== null}
           <div>
             <p class="text-white"><b style={{backgroundColor : "red" , padding : '2px'}}>{yourId}</b></p>
             <input type="text" class="border border-gray-300 px-3 py-2 rounded-md mb-4" bind:value={codeId} placeholder="Enter your Friend's id">
             <button class="bg-blue-500 text-white px-4 py-2 rounded-md" on:click={connect}>Take Your Ticket</button>
          </div>
          {:else}
              <p class="text-white">Connecting...</p>
           {/if}
           {/if}
           <button class="bg-blue-500 text-white px-4 py-2 rounded-md" on:click={()=>{multiplayerMode = true ; multiplayer();}}>MultiPlayer</button>
          <button class="bg-blue-500 text-white px-4 py-2 rounded-md" on:click={()=>{showOverlay = false}}>Anyway</button>
     
      </div>
    </div>
  
     {/if}

     
    
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div 
  class="fixed top-4 right-4 flex items-center justify-center w-16 h-16 rounded-full bg-gray-300 hover:bg-gray-400 cursor-pointer z-50"
  on:click={handleToggle}
>
  {toggle ? "Day" : "Night"}
</div>
<button class="fixed top-24 right-4 flex items-center justify-center w-16 h-16 rounded-full bg-gray-300 hover:bg-gray-400 cursor-pointer z-50" on:click={erase}>Erase</button>

    
    <style>
      #three-scene {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

     
  .overlay-content {
    background-color: white;
    padding: 2rem;
    display:  flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 100%; 
  }
    </style>
    