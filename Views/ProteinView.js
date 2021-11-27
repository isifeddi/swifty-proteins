import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-native";
import { View, Text } from "react-native";
import { Appbar } from "react-native-paper";

import { GLView } from "expo-gl";
import * as Sharing from 'expo-sharing';
import { Renderer } from "expo-three";
import {
    //OrbitControls,
    Group,
    SphereGeometry,
    Mesh,
    MeshPhongMaterial,
    PerspectiveCamera,
    Scene,
    BoxGeometry,
    Vector3,
    Color,
    DirectionalLight,
    StereoCamera
} from "three";
//import { Interaction } from 'three.interaction';

import OrbitControlsView from 'expo-three-orbit-controls';
//import {CSS2DObject} from "../node_modules/three/examples/jsm/renderers/CSS2DRenderer"

export const ProteinView = () => {

    const location = useLocation();
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [mount, setMounted] = useState(false);
    const [pdb, setPdb] = useState(null);
    const [glView, setGlView] = React.useState(null);

    useEffect(() => {
        setPdb(location.state.data)
        setMounted(true);
        setLoading(false);
    }, [location]);

    if (!mount && loading) {
        return <Text style={{ margin: 'auto' }}>Loading</Text>
    }
    if (!mount && !loading) {
        return <Text style={{ margin: 'auto' }}>ERROR PLEAASE RETRY</Text>
    }

    // const objectClick = (atom) => {
    //     console.log("atom clicked >> ", atom[4])
    // }
    // var raycaster = new THREE.Raycaster();
    // var mouse = new THREE.Vector2();
    var root = new Group();
    // function onDocumentMouseDown(event) {
    //     event.preventDefault();

    //     mouse.x = (event.nativeEvent.locationX / renderer.domElement.clientWidth) * 2 - 1;
    //     mouse.y = - (event.nativeEvent.locationY / renderer.domElement.clientHeight) * 2 + 1;

    //     raycaster.setFromCamera(mouse, camera);

    //     var intersects = raycaster.intersectObjects(root);

    //     console.log(intersects)

    //     if (intersects.length > 0) {

    //         intersects[1].object.callback();

    //     }

    // }

    const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.z = 1500;

    const shareScreen = () => {
        GLView.takeSnapshotAsync(glView, { format: "jpeg" }).then(({ localUri }) => {
            Sharing.shareAsync(localUri, {}).then(r => console.log(r)).catch(e => console.log(e))
        }).catch(e => console.log(e));
    }

    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => history.push("/list")} />
                <Appbar.Content title="Protein" />
                <Appbar.Action icon="share" onPress={() => shareScreen()} />
            </Appbar.Header>
            <OrbitControlsView style={{ flex: 1 }} camera={camera}>
                <GLView
                    style={{ flex: 1 }}
                    onContextCreate={async (gl) => {
                        // GL Parameter disruption
                        const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

                        // Renderer declaration and set properties
                        const renderer = new Renderer({ gl });
                        renderer.setSize(width, height);
                        renderer.setClearColor("#000");

                        // Scene declaration, add a fog, and a grid helper to see axes dimensions
                        const scene = new Scene();

                        //const interaction = new Interaction(renderer, scene, camera);

                        scene.add(camera);

                        // light
                        var light = new THREE.PointLight(0xffffff, 1);
                        camera.add(light);

                        /********** render ligand *************/


                        scene.add(root);
                        var offset = new Vector3();

                        const geometryAtoms = pdb.geometryAtoms;
                        const geometryBonds = pdb.geometryBonds;
                        const json = pdb.json;

                        const boxGeometry = new BoxGeometry(1, 1, 1);
                        const sphereGeometry = new SphereGeometry();

                        geometryAtoms.computeBoundingBox();
                        geometryAtoms.boundingBox.getCenter(offset).negate();

                        geometryAtoms.translate(offset.x, offset.y, offset.z);
                        geometryBonds.translate(offset.x, offset.y, offset.z);

                        let positions = geometryAtoms.getAttribute('position');
                        const colors = geometryAtoms.getAttribute('color');

                        const position = new Vector3();
                        const color = new Color();

                        for (let i = 0; i < positions.count; i++) {

                            const atom = json.atoms[i];

                            position.x = positions.getX(i);
                            position.y = positions.getY(i);
                            position.z = positions.getZ(i);

                            color.r = colors.getX(i);
                            color.g = colors.getY(i);
                            color.b = colors.getZ(i);

                            const material = new MeshPhongMaterial({ color: color });

                            const object = new Mesh(sphereGeometry, material);
                            object.position.copy(position);
                            object.position.multiplyScalar(75);
                            object.scale.multiplyScalar(25);

                            root.add(object);

                            const text = document.createElement('div');
                            text.className = 'label';
                            text.style.color = 'rgb(' + atom[3][0] + ',' + atom[3][1] + ',' + atom[3][2] + ')';
                            text.textContent = atom[4];

                            //const label = new CSS2DObject(text);
                            //label.position.copy(object.position);
                            //root.add(label);

                        }

                        positions = geometryBonds.getAttribute('position');

                        const start = new Vector3();
                        const end = new Vector3();

                        for (let i = 0; i < positions.count; i += 2) {

                            start.x = positions.getX(i);
                            start.y = positions.getY(i);
                            start.z = positions.getZ(i);

                            end.x = positions.getX(i + 1);
                            end.y = positions.getY(i + 1);
                            end.z = positions.getZ(i + 1);

                            start.multiplyScalar(75);
                            end.multiplyScalar(75);

                            const object = new Mesh(boxGeometry, new MeshPhongMaterial(0xffffff));
                            object.position.copy(start);
                            object.position.lerp(end, 0.5);
                            object.scale.set(5, 5, start.distanceTo(end));
                            object.lookAt(end);
                            root.add(object);

                        }
                        scene.add(root);

                        {/* scene.traverse(function (object) {
                        object.frustumCulled = false;
                    }); */}

                        //**********

                        // Render function
                        const render = () => {
                            timeout = requestAnimationFrame(render);
                            renderer.render(scene, camera);
                            // ref.current.getControls()?.update();
                            gl.endFrameEXP();
                        };
                        render();
                        setGlView(gl);
                    }}
                >
                </GLView>
            </OrbitControlsView>
        </>
    );
}