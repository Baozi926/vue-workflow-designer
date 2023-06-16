<style lang="scss">
.workflow-layout {
    .node-item-label {
        color: black;
        z-index: 100000;
    }

    .jtk-connector.selected {
        z-index: 200;

        path {
            stroke: #409eff;
            stroke-width: 2.4;
        }
    }

    .label-editor {
        // width: 252px;
        // width: 100%;
        // height: 100%;
        padding: 2px;
        overflow: hidden;
        color: #525967;
        font-size: 12px;
        text-align: center;
        border: none !important;
        
    }
}
</style>

<style lang="scss" scoped>
.workflow-layout {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .head {
        height: 60px;
        display: flex;
        align-items: center;
        background: #fff;
        box-shadow: rgba(6, 30, 53, 0.1) 0px 1px 0 0;
        border-bottom: 1px solid #ebecee;
        padding: 0 20px;
    }

    .main {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        flex: 1;
    }

    .flow-node-list {
        padding: 10px;
        background: #fff;
        display: flex;
        flex-direction: column;
        align-items: center;

        .menu {
            cursor: pointer;
            border-radius: 8px;
            // border: 1px solid black;
            width: 120px;
            height: 40px;
            margin: 10px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: 5px;
            display: flex;
            background: #fff;
            box-shadow: rgba(6, 30, 53, 0.1) 0px 1px 2px 1px;
            color: black;
        }

        flex-basis: 200px;
        width: 200px;
    }

    .flow_region {
        background-color: rgb(245, 246, 248);
        flex: 1;

        .flow-wrap {
            height: 100%;
            width: 100%;
            overflow: hidden;

            #flow-container {
                position: relative;
                width: 100%;
                height: 100%;
            }
        }
    }

    .property-panel {
        width: 300px;
        background: #fff;
    }
}
</style>

<template>
    <div class="workflow-layout">
        <div class="head">
            <ElButton @click="deleteNodeOrLine" class="button">删除</ElButton>

            <ElButton @click="copyConfig" class="button">拷贝配置</ElButton>
        </div>

        <div class="main">
            <div class="flow-node-list">
                <li class="menu" v-for="menu in data.menus.filter((v) => {
                    return !['start', 'end'].includes(v?.type);
                })" :key="menu.type" draggable="true" @dragstart="dragstart($event, menu)">
                    <!-- <i :class="`iconfont ${menu.iconName}`"></i> -->
                    {{ menu.name }}
                </li>
            </div>
            <div class="flow_region" @click="onCanvasClick($event)">
                <div id="flowWrap" ref="flowWrap" class="flow-wrap" @drop="onDrop($event)" @dragover="allowDrop($event)">
                    <div id="flow-container">
                        <FlowNode @click="onFlowNodeClick($event, item)" :isActive="activeNode?.id === item.id"
                            v-for="item in data.nodeList" :id="item.id" :key="item.id" :node="item"
                            @setNodeName="setNodeName" @changeLineState="changeLineState" />
                    </div>
                </div>
            </div>
            <div class="property-panel">
                <template v-if="activeNode">
                    <PropertyPanel :node="activeNode"></PropertyPanel>
                </template>
                <template v-else-if="activeLine">
                    <LinePanel :line="activeLine"></LinePanel>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, onUnmounted, nextTick, toRefs } from "vue";
import FlowNode from "./FlowNode.vue";
import jsPlumbService from "./jsPlumbService";
import {
    jsplumbSourceOptions,
    jsplumbTargetOptions,
    jsplumbConnectOptions,
    jsplumbSetting,
} from "./config";
import { uuid } from "./Util";
import { NodeConfig, LineConfig } from "./types";
import PropertyPanel from "./PropertyPanel.vue";
import LinePanel from "./LinePanel.vue";
import { flowConfig } from './tempData'
// import 'element-plus/es/components/button/style/css'
// import 'element-plus/es/components/input/style/css'

// import { ElButton, ElInput } from 'element-plus'

const onFlowNodeClick = (event, item) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveNode(item);
};

const copyToClipboard = (str) => {
    const el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
};

const copyConfig = () => {
    const config = {
        nodeList: data.nodeList,
        connections: data.connections,
    };

    console.log(config);

    copyToClipboard(JSON.stringify(config));
};

const data: {
    nodeList: NodeConfig[];
    connections: any[];
    menus: any[];
    currentItem?: any;
    activeNode?: NodeConfig | null;
    activeLine?: LineConfig | null;
} = reactive({
    ...flowConfig,
    menus: [
        {
            type: "start",
            name: "开始",
        },
        {
            type: "end",
            name: "结束",
        },
        {
            type: "node",
            name: "审批",
        }, {
            type: "sendCopy",
            name: "抄送",
        },{
            type: "childFlow",
            name: "子流程",
        },
    ],
    currentItem: null,
    activeNode: null,
    activeLine: null,
});

let plumbIns;

const getLineDataByLineInstance = (line) => {
    return data.connections.find((v) => {
        return (
            line.sourceId === v.source && line.targetId === v.target
        );
    })

}

const onCanvasClick = (event) => {
    event.preventDefault();

    plumbIns.getAllConnections().forEach((line) => {

        const labelEditor = line.getOverlay('LabelEditor');

        if (labelEditor.visible) {
            const lineData = getLineDataByLineInstance(line);
            lineData.name = labelEditor.canvas.value;
            line.getOverlay('Label').setLabel(lineData.name)
        }
        ;

    });



    setActiveNode(null);

    setActiveLine(null);
};

const setActiveNode = (item) => {
    data.activeNode = item;

    if (item) {
        setActiveLine(null);
    }
};

const setActiveLine = (conn) => {
    let lineData;

    if (conn) {
        lineData = data.connections.find((v) => {
            return v.source === conn.sourceId && v.target === conn.targetId;
        });



    }

    data.activeLine = lineData;

    let lines = plumbIns.getAllConnections();

    lines.forEach((line) => {
        if (line.id === conn?.id) {
            line.canvas.classList.add("selected");
            line.getOverlay('LabelEditor').setVisible(true);
            line.getOverlay('Label').setVisible(false);
        } else {
            line.canvas.classList.remove("selected");
            line.getOverlay('LabelEditor').setVisible(false);
            line.getOverlay('Label').setVisible(true);
        }
    });

    if (conn) {
        setActiveNode(null);
    }

    // jsPlumb
};

onUnmounted(() => {
    if (plumbIns) {
        plumbIns.destroy();
    }
});

const deleteNodeOrLine = () => {
    const activeLine = data.activeLine;

    //线
    if (activeLine) {
        const lineIns = plumbIns.getAllConnections().find((v) => {
            return (
                v.sourceId === activeLine.source && v.targetId === activeLine.target
            );
        });

        plumbIns.deleteConnection(lineIns);
    }

    const activeNode = data.activeNode;

    //节点
    if (activeNode) {
        const lines = plumbIns.getAllConnections();
        const deleteLines: any[] = [];

        lines.forEach((line) => {
            const activeNodeId = activeNode.id;
            if (line.sourceId === activeNodeId || line.targetId === activeNodeId) {
                deleteLines.push(line);
            }
        });

        deleteLines.forEach((line) => {
            plumbIns.deleteConnection(line);
        });

        data.connections = data.connections.filter((v) => {
            if (v.source === activeNode.id || v.target === activeNode.id) {
                return false;
            }

            return true;
        });

        data.nodeList = data.nodeList.filter((v) => {
            return v.id !== activeNode.id;
        });
    }
};

onMounted(() => {
    jsPlumbService.setContainerId("flow-container");

    plumbIns = jsPlumbService.getInstance();

    plumbIns.ready(function () {
        plumbIns.importDefaults({ ...jsplumbSetting, Container: 'flow-container' });
        plumbIns.setSuspendDrawing(false, true);

        data.connections.forEach((v) => {
            const conn = plumbIns.connect(
                {
                    id: v.id,
                    // 对应上述基本概念
                    source: v.source,
                    target: v.target,
                    // anchor: ['Left', 'Right', 'Top', 'Bottom', [0.3, 0, 0, -1], [0.7, 0, 0, -1], [0.3, 1, 0, 1], [0.7, 1, 0, 1]],
                    //@ts-ignore
                    // connector: ['StateMachine'],
                    // endpoint: 'Blank',
                    // overlays: [['Arrow', { width: 8, length: 8, location: 1 }]], // overlay
                    // // 添加样式
                    // paintStyle: { stroke: '#909399', strokeWidth: 2 }, // connector
                    // endpointStyle: { fill: '#909399', outlineStroke: '#606266', outlineWidth: 1 } // endpoint
                },
                jsplumbConnectOptions
            );

            if (v.name) {
                conn.getOverlay("Label").setLabel(v.name);
            }


        });

        data.nodeList.forEach((v) => {
            initNode(v);
        });

        // 连线创建成功后，维护本地数据
        plumbIns.bind("connection", (evt) => {
            addLine(evt);
        });
        //   //连线双击删除事件
        //   this.jsPlumb.bind("dblclick",(conn, originalEvent) => {
        //     this.confirmDelLine(conn)
        //   })
        //断开连线后，维护本地数据
        plumbIns.bind("connectionDetached", (evt) => {
            deleLine(evt);
        });

        plumbIns.bind("click", (conn, originalEvent) => {
            originalEvent.stopPropagation();
            setActiveLine(conn);
        });
    });
});

const log = (...argument) => {
    console.log(...argument);
};

const addLine = (line) => {
    data.connections.push({
        source: line.source.id,
        target: line.target.id,
        name: "连接线",
        id: uuid(),
        remark: "",
    });

    log(data.connections);
};

const deleLine = (line) => {
    data.connections = data.connections.filter((item) => {
        return !(item.source === line.sourceId && item.target === line.targetId);
    });

    log(data.connections);
};

const setNodeName = () => { };

const changeLineState = () => { };

const dragstart = (evt, menu) => {
    data.currentItem = menu;
};

const addNode = (params) => {
    data.nodeList.push(params);
    initNode(params);
};

const initNode = (params) => {
    nextTick(() => {
        const nodeId = params.id;
        plumbIns.makeSource(nodeId, jsplumbSourceOptions);
        plumbIns.makeTarget(nodeId, jsplumbTargetOptions);

        plumbIns.draggable(nodeId, {
            grid: [5, 5],
            drag: (params) => {
                // this.alignForLine(nodeId, params.pos)
            },
            start: () => { },
            stop: (params) => {
                const pos = params.pos;
                // this.auxiliaryLine.isShowXLine = false
                // this.auxiliaryLine.isShowYLine = false
                // this.changeNodepos(nodeId, params.pos)
                data.nodeList.some((vv) => {
                    if (nodeId == vv.id) {
                        vv.pos.left = pos[0];
                        vv.pos.top = pos[1];
                        return true;
                    } else {
                        return false;
                    }
                });
            },
        });
    });
};

const onDrop = (event) => {
    const containerRect = plumbIns.getContainer().getBoundingClientRect();
    // const scale = this.getScale();
    let left = event.pageX - containerRect.left;
    let top = event.pageY - containerRect.top;
    const currentItem = data.currentItem as any;
    if (currentItem) {
        var temp = {
            type: currentItem.type,
            name: currentItem.name,
            id: uuid(),
            pos: {
                top: top - 20,
                left: left - 60,
            },
        };
        // this.
        addNode(temp);
    }
};

const allowDrop = (evt) => {
    evt.preventDefault();
    return true;
};

const { activeNode, activeLine } = toRefs(data);
</script>
