import { jsPlumb, jsPlumbInstance } from "jsplumb";
import { FlowConfig, LineConfig, NodeConfig } from "./types";
import { deepCloneJSON } from "./Utils";

class JsPlumbService {
  plumbIns: jsPlumbInstance | null;
  containerId: String;

  setContainerId(val) {
    this.containerId = val;
  }

  batch(cb) {
    if (!this.plumbIns) {
      throw new Error("plumbIns is null");
    }

    this.plumbIns.batch(cb, true);
  }

  getBoundingClientRect() {
    if (!this.plumbIns) {
      throw new Error("plumbIns is null");
    }

    return this.plumbIns.getContainer().getBoundingClientRect();
  }

  checkWorkflow(config: FlowConfig) {
    alert("TODO");
  }

  autoLayoutFlow(config_: FlowConfig) {
    const config = deepCloneJSON(config_);

    const rect = this.getBoundingClientRect();

    const width = rect.width;

    const height = rect.height;

    const nodeWidth = 120;

    const startNode = config.nodeList.find((v) => {
      return v.type === "start";
    });

    if (!startNode) {
      return;
    }

    const VERTICAL_GAP = 100;

    const startTop = 50;

    startNode.pos.left = width / 2 - nodeWidth / 2;
    startNode.pos.top = startTop;

    const getChildren = (node: NodeConfig, config: FlowConfig) => {
      const id = node.id;

      const childrenId = config.connections
        .filter((v) => {
          return v.source === id;
        })
        .map((v) => {
          return v.target;
        });

      return config.nodeList.filter((v) => {
        return childrenId.includes(v.id) && v.type !== "end";
      });
    };

    const layoutChildren = (
      node,
      level,
      config: FlowConfig,
      { width, startTop }
    ) => {
      const children = getChildren(node, config);

      const childrenLength = children.length;

      if (!childrenLength) {
        return;
      }

      const horizontal = width / (childrenLength + 1);

      children.forEach((v, i) => {
        v.pos.left = (i + 1) * horizontal - nodeWidth / 2;
        v.pos.top = level * VERTICAL_GAP + startTop;

        layoutChildren(v, 1 + level, config, { width, startTop });
      });
    };

    layoutChildren(startNode, 1, config, { width, startTop });

    const endNode = config.nodeList.find((v) => {
      return v.type === "end";
    });

    if (endNode) {
      endNode.pos.left = width / 2 - nodeWidth / 2;
      endNode.pos.top = height - startTop - 40;
    }

    return config;
  }

  setSuspendDrawing(val) {
    if (!this.plumbIns) {
      throw new Error("plumbIns is null");
    }
    this.plumbIns.setSuspendDrawing(val, true);
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

  getAutoLayout;
}

const instance = new JsPlumbService();

//@ts-ignore
window.jsPlumbService = instance;

export default instance;
