<style lang="scss">
.panel-wrapper {
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
    <div class="panel-wrapper">
        <div class="title">连接线配置</div>
        <div class="content">
            <div class="row">
                ID:{{ line && line.id }}
            </div>

            条件设置

        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, toRefs } from 'vue';
const props = defineProps({
    line: Object
})



const { line } = toRefs(props)


</script>
