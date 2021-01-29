<template>
    <div id="PdfView">
        <iframe :src="fileUrl" width="100%" height="100%" frameborder="0"></iframe>
    </div>
</template>

<script>
export default {
    name: "PdfView",
    data() {
        return {
            fileUrl: '',
            src: '',
        }
    },
    created() {
        this.src = this.$route.query.src
    },
    mounted() {
        this.fileUrl = './pdf/web/viewer.html?file=' + this.$route.query.src;
    }
}
</script>

<style scoped lang="less">
#PdfView {
    height: 100%;
}
</style>
