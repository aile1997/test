// import * as THREE from "three";

const filtHelp = (arrModle: any, otherGroup: THREE.Group, model: THREE.Group) => {
  arrModle.forEach((element: any) => {
    applyMatrix(element, element.parent, model);
    element.parent.remove(element);
    otherGroup.add(element);
  });
};

const applyMatrix = (element: THREE.Object3D, elementPar: any, model: THREE.Group) => {
  if (elementPar && elementPar !== model) {
    element.applyMatrix4(elementPar.matrix);
    elementPar.updateMatrixWorld(true);
    applyMatrix(element, elementPar.parent, model);
  }
};

export { filtHelp };
