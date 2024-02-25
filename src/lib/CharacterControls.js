// @ts-nocheck
import * as THREE from 'three';

const W = 'w';
const A = 'a';
const S = 's';
const D = 'd';
const DIRECTIONS = [W,A,S,D];
let sound ;

let codeId = '';
let yourId = null;
let avatars = {};
let mixerNew;
let animationsNew;
let peer;
export class CharacterControls {
    constructor(
        model,
        mixer,
        animationsMap,
        orbitControl,
        camera,
        currentAction
    ) {
        this.animationsMap = new Map(); 
        this.toggleRun = true;
        this.walkDirection = new THREE.Vector3();
        this.rotateAngle = new THREE.Vector3(0, 1, 0);
        this.rotateQuarternion = new THREE.Quaternion();
        this.cameraTarget = new THREE.Vector3();
        this.fadeDuration = 0.01;
        this.runVelocity = 5;
        this.walkVelocity = 4;
        this.model = model;
        this.mixer = mixer;
        this.animationsMap = animationsMap;
        this.currentAction = currentAction;
        this.characterOffset = new THREE.Vector3(-5, 0.8, 12);
        this.animationsMap.forEach((value, key) => {
            if (key == currentAction) {
                value.play();
            }
        });
        this.orbitControl = orbitControl;
        this.camera = camera;
        this.trainDetect = false;
        this.trainDetectPeer = false;
        this.updateCameraTarget(0, 0);
        this.addAudio(this.camera);
    }

    switchRunToggle() {
        this.toggleRun = !this.toggleRun;
    }

    addAudio(camera){
        const listener = new THREE.AudioListener();
        camera.add(listener);

        sound = new THREE.Audio(listener);
        const loader = new THREE.AudioLoader();
        loader.load('jungleUpdate.mp3',(buffer)=>{
              sound.setBuffer(buffer);
              sound.setVolume(1);
              sound.setLoop(true); 
        });
   }

   
    update(delta, keysPressed,  modelBoundingBox , peerBoundingBox ,boundingbox, tram, box3TramC1, box3TramC2 , conn , codeId , avatars , animationsNew ,peerModelMesh , positionCursor) {
       let intersects = false ;
       modelBoundingBox.setFromObject(this.model);
            for (let i = 0; i < boundingbox.length; i++) {
                if (modelBoundingBox.intersectsBox(boundingbox[i])) {
                    intersects = true;
                    break; 
                }
        }  

      
        if(peerModelMesh && avatars && conn && conn.peer){
                peerModelMesh.position.copy(avatars[conn.peer].position);
        }

       if(modelBoundingBox && box3TramC1 && box3TramC2){
           if (modelBoundingBox.intersectsBox(box3TramC1) || modelBoundingBox.intersectsBox(box3TramC2)) {
                this.trainDetect = true;
           }else{
                this.trainDetect = false;
           }
       }

      if(avatars && conn && conn.peer){
        peerBoundingBox.setFromObject(avatars[conn.peer]);
        if (peerBoundingBox.intersectsBox(box3TramC1) || peerBoundingBox.intersectsBox(box3TramC2)) {
              console.log('remo');
            this.trainDetectPeer = true;
        }else{
            this.trainDetectPeer = false;
        }
      }

        if(this.trainDetect){
            sound.play();
      }else{
         sound.stop();
      }




        const directionPressed = DIRECTIONS.some(
            key => keysPressed[key] == true
        );

        let play = '';
        if (directionPressed && !this.trainDetect) {
            play = 'walk';
        } else if (this.trainDetect && directionPressed && tram.children[0].position.y === 0) {
            play = 'walk';
        } else if (this.trainDetect) {
            play = 'sit';
        } else {
            play = 'idle';
        }

      

    
        this.sendMessage(conn , codeId, this.model.position , directionPressed , this.trainDetectPeer , positionCursor);


       

        if (this.currentAction != play) {
            const toPlay = this.animationsMap.get(play);
            const current = this.animationsMap.get(this.currentAction);

            if (current) {
                current.fadeOut(this.fadeDuration);
            }
            if (toPlay) {
                toPlay.reset().fadeIn(this.fadeDuration).play();
            }

            this.currentAction = play;
    }

        this.mixer.update(delta);
        this.walkDirection.x = this.walkDirection.y = this.walkDirection.z = 0;
        if (this.currentAction === 'run' || this.currentAction === 'walk') {
            var angleYCameraDirection = Math.atan2(
                this.camera.position.x - this.model.position.x,
                this.camera.position.z - this.model.position.z
            );
            var directionOffset = this.directionOffset(keysPressed);

            this.rotateQuarternion.setFromAxisAngle(
                this.rotateAngle,
                angleYCameraDirection + directionOffset
            );
            this.model.quaternion.rotateTowards(
                this.rotateQuarternion,
                0.2
            );

            this.camera.getWorldDirection(this.walkDirection);
            this.walkDirection.y = 0;
            this.walkDirection.normalize();
            let velocity ;
            
            if(intersects){
                velocity = 0;
                this.currentAction= 'idle';
            }else{
                 velocity = 1;
            }

           
            let moveX = this.walkDirection.x * velocity * delta;
            let moveZ = this.walkDirection.z * velocity * delta;

            this.model.position.x += moveX;
            this.model.position.z += moveZ;

            this.updateCameraTarget(moveX , moveZ);
        }else if (this.currentAction === 'sit') {     
                this.updateCharacterPosition(tram , this.trainDetect, this.model);
                this.updateCameraTarget(0, -1);
                this.characterOffset = new THREE.Vector3(-0.3,0.3,-0.5);
        }

        if(this.trainDetectPeer){

            this.updateCharacterPosition(tram , this.trainDetectPeer, avatars[conn.peer]);
            this.characterOffset = new THREE.Vector3(0,0.3,0);
        }

    }


    updateCharacterPosition(tram , trainDetect , model ) {
        const tramPosition = new THREE.Vector3();
        const tramQuaternion = new THREE.Quaternion();
        const tramScale = new THREE.Vector3();
        tram.matrixWorld.decompose(tramPosition, tramQuaternion, tramScale);
        const rotatedCharacterOffset = this.characterOffset.clone().applyQuaternion(tramQuaternion);
        model.position.copy(tramPosition).add(rotatedCharacterOffset);
        model.rotation.copy(tram.rotation);
        this.orbitControl.minDistance = 0.1;
        this.orbitControl.maxDistance = 2;
        this.orbitControl.enablePan = false;
        this.orbitControl.maxPolarAngle = Math.PI / 2 - 0.05;
    }
    updateCameraTarget(moveX, moveZ) {
        this.camera.position.x += moveX;
        this.camera.position.z += moveZ;

        this.cameraTarget.x = this.model.position.x;
        this.cameraTarget.y = this.model.position.y + 0.9;
        this.cameraTarget.z = this.model.position.z;
        this.orbitControl.target = this.cameraTarget;
    }
    directionOffset(keysPressed) {
        var directionOffset = 0;

        if (keysPressed[W]) {
            directionOffset = Math.PI;
        }

        return directionOffset;
    } 
     //multiplayer
     sendMessage(conn , codeId , targetPosition ,  directionPressed , trainDetectPeer , positionCursor) {
       if(conn){
           console.log("conn");
         conn.on('open', () => {
         console.log('Connected to:', codeId);
       });

          if(directionPressed){
             conn.send({targetPosition , directionPressed , trainDetectPeer , positionCursor});
          }else{
              conn.send({directionPressed , trainDetectPeer , positionCursor});
          }
       }
   }
   

    
    
}

