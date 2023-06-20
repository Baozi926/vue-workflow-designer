import { jsPlumb, jsPlumbInstance } from "jsplumb";
import {
  FlowConfig,
  FlowValidationErrors,
  LineConfig,
  NodeConfig,
  NodeError,
  NodeTypes,
} from "./types";
import { deepCloneJSON } from "./Utils";

const _getAnsestors = (
  node: NodeConfig,
  config: FlowConfig,
  result: NodeConfig[]
) => {
  const connections = config.connections.filter((v) => {
    return v.target === node.id;
  });

  const parents = config.nodes.filter((v) => {
    return connections.some((vv) => {
      return vv.source === v.id;
    });
  });

  parents.forEach((v) => {
    result.push(v);
    _getAnsestors(v, config, result);
  });
};

/**
 * 获取所有祖先
 *
 */
const getAnsestors = (node: NodeConfig, config: FlowConfig) => {
  const result: NodeConfig[] = [];

  _getAnsestors(node, config, result);

  return result;
};

/**
 * 获取第一代孩子节点
 *
 */
const getChildren = (node: NodeConfig, config: FlowConfig) => {
  const id = node.id;

  const childrenId = config.connections
    .filter((v) => {
      return v.source === id;
    })
    .map((v) => {
      return v.target;
    });

  return config.nodes.filter((v) => {
    return childrenId.includes(v.id);
  });
};

const getDescendants = (node: NodeConfig, config: FlowConfig) => {
  const result: NodeConfig[] = [];

  _getDescendants(node, config, result);

  return result;
};

/**
 * 获取所有后代
 *
 */
const _getDescendants = (
  node: NodeConfig,
  config: FlowConfig,
  result: NodeConfig[]
) => {
  const children = getChildren(node, config);

  children.forEach((v) => {
    result.push(v);
    _getDescendants(v, config, result);
  });
};

class PlumbService {
  plumbIns: jsPlumbInstance | null;
  containerId: String;

  constructor(){
    
  }

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

  /**
   *
   * 只判断流程节点和线的逻辑是否有效，不回去判断流程里的条件是否有效
   * 1. 判断是否能回溯到开始节点
   * 2. 判断是否能追溯到结束节点
   *
   */
  checkNodeValidation(
    node: NodeConfig,
    config: FlowConfig,
    conditionValidate: Function
  ) {
    const errors: NodeError[] = [];

    const ansestors = getAnsestors(node, config);

    //判断先祖节点中是否有开始节点
    const hasStart = ansestors.some((v) => {
      return v.type === NodeTypes.start;
    });

    if (!hasStart) {
      errors.push(NodeError.noStart);
    }

    if (
      ![NodeTypes.sendCopy, NodeTypes.widgetFlow, NodeTypes.end].includes(
        node.type
      )
    ) {
      const descendants = getDescendants(node, config);

      //判断子孙节点里是否有结束节点
      const hasEnd = descendants.some((v) => {
        return v.type === NodeTypes.end;
      });

      if (!hasEnd) {
        errors.push(NodeError.noEnd);
      }
    }

    const conditionValidation = conditionValidate(node);

    if (conditionValidation) {
      errors.push(conditionValidation);
    }

    return {
      errors: errors,
      node: node,
    };
  }

  /**
   * 检查工作流的有效性
   *
   */
  checkWorkflowValidation(
    config: FlowConfig & {
      conditionValidate: Function;
    }
  ): FlowValidationErrors {

    const errors: FlowValidationErrors = {
      nodes: [],
      connections: [],
    };

    config.nodes.forEach((v) => {
      if (v.type !== NodeTypes.start) {
        const res = this.checkNodeValidation(
          v,
          config,
          config.conditionValidate
        );
        if (res.errors.length) {
          errors.nodes.push(res);
        }
      }
      return false;
    });

    console.log(errors);

    return errors;
  }

  //TODO 待改善，不好用！
  autoLayoutFlow(config_: FlowConfig) {
    const config = deepCloneJSON(config_);

    const rect = this.getBoundingClientRect();

    const width = rect.width;

    const height = rect.height;

    const nodeWidth = 120;

    const startNode = config.nodes.find((v) => {
      return v.type === NodeTypes.start;
    });

    if (!startNode) {
      return;
    }

    const VERTICAL_GAP = 100;

    const startTop = 50;

    startNode.pos.left = width / 2 - nodeWidth / 2;
    startNode.pos.top = startTop;

    const layoutChildren = (
      node,
      level,
      config: FlowConfig,
      { width, startTop }
    ) => {
      const children = getChildren(node, config).filter((v) => {
        return v.type !== NodeTypes.end;
      });

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

    const endNode = config.nodes.find((v) => {
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


export default PlumbService;
