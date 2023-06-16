import { jsPlumb, jsPlumbInstance } from "jsplumb";

class jsPlumbService {
  plumbIns: jsPlumbInstance;
  containerId: String;

  setContainerId(val) {
    this.containerId = val;
  }

  getInstance() {
    if (this.plumbIns) {
      return this.plumbIns;
    }

    this.plumbIns = jsPlumb.getInstance({
        Container:this.containerId
    });

    return this.plumbIns;
  }
}

const instance = new jsPlumbService();

export default instance;
