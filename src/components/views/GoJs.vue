<template>
    <div id="GoJs">
        <div id="myDiagramDiv" style="height: 700px;"></div>
    </div>
</template>

<script>
import go from 'gojs'

export default {
    name: "GoJs",
    data() {
        return {
            
        }
    },
    mounted(){
        this.init();
    },
    methods: {
        init() {
          let $ = go.GraphObject.make;
          let myDiagram = $(go.Diagram, "myDiagramDiv", {
              "undoManager.isEnabled": true
          });
          let myModel = $(go.Model);
          myModel.nodeDataArray = [
            {key: 'A'},
            {key: 'B'},
            {key: 'C'},
            {key: 'D'},
          ];
          myDiagram.model = myModel;
        },
    }
}
</script>

<style scoped lang="less">

</style>