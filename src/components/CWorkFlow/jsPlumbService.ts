import { jsPlumb, jsPlumbInstance } from "jsplumb";
import { flowConfig } from "./tempData";

class JsPlumbService {
  plumbIns: jsPlumbInstance | null;
  containerId: String;

  setContainerId(val) {
    this.containerId = val;
  }

  getFlowConfig() {
    return flowConfig;
  }
  setSuspendEvents(val: boolean) {
    if (!this.plumbIns) {
      throw new Error("plumbIns is null");
    }
    this.plumbIns.setSuspendEvents(val);
  }

  getInstance() {
    if (this.plumbIns) {
      return this.plumbIns;
    }

    this.plumbIns = jsPlumb.getInstance({
      Container: this.containerId,
    });

    //@ts-ignore
    this.plumbIns.overlayClass = "jtk-overlay caiwf-line-label";

    // debugger;

    // jsPlumb.getDefaultToolkit().setDefaultLabelStyle({
    //   font: "12px sans-serif",
    //   fillStyle: "black",
    //   cssClass: "my-custom-label-class",
    // });

    return this.plumbIns;
  }

  clearAllLines() {
    if (!this.plumbIns) {
      throw new Error("plumbIns is null");
    }
    this.plumbIns.deleteEveryConnection();
  }

  clearAllEndPoints() {
    if (!this.plumbIns) {
      throw new Error("plumbIns is null");
    }
    this.plumbIns.deleteEveryEndpoint();
  }

  clearAll() {
    this.clearAllLines();
    this.clearAllEndPoints();
  }

  /**
   *
   *
   * @param event name
   * @param cb cb
   *
   */
  bind(event, cb) {
    if (!this.plumbIns) {
      throw new Error("plumbIns is null");
    }

    this.plumbIns.unbind(event);
    this.plumbIns.bind(event, (evt) => {
      cb(evt);
    });
  }

  destroy() {
    if (this.plumbIns) {
      //@ts-ignore
      this.plumbIns.destroy();
      this.plumbIns = null;
    }
  }
}

const instance = new JsPlumbService();

//@ts-ignore
window.jsPlumbService = instance;

export default instance;
