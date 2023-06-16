<style lang="scss">
.form-wrapper {
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: black;

    .title {
        padding: 8px 0;
        box-shadow: rgba(6, 30, 53, 0.1) 0px 1px 0 0;
        width: 100%;
        margin-bottom: 10px;
    }
}
</style>
<template>
    <div class="form-wrapper">
        <div class="title">
            属性面板
        </div>

        <el-form @submit.native.prevent :model="node" label-width="40px">
            <el-form-item label="name">
                <el-input v-model="node.name" autocomplete="off" />
            </el-form-item>


        </el-form>
    </div>
</template>


<script setup lang="ts">

import { defineProps, toRefs } from 'vue'
const props = defineProps({
    node: {
        type: Object,
        default: {},
        require: true
    }
})



const { node } = toRefs(props)


</script>