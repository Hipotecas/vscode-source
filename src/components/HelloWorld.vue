<script setup lang="ts">
import { ref } from 'vue'
import { Emitter, Event } from '../utils/event'
import {Document3} from '../utils/example'
defineProps<{ msg: string }>()

const count = ref(0)

const doc = new Document3()
const onDocDidChange = Event.debounce(doc.onDidChange, (prev: string[] | undefined , cur) => {
  if (!prev) {
    prev = [cur]
  } else if (prev.indexOf(cur) < 0) {
    prev.push(cur)
  }
  return prev
}, 10)

let num = 0
onDocDidChange(keys => {
  num++
  console.log('[ keys ] >', keys)
  if (num === 1) {
    doc.setText('4')
    console.log('[ num === 1, keys ] >', keys)
  } else if (num === 2) {
    console.log('[ num === 2, keys ] >', keys)
  }
})
doc.setText('1')
doc.setText('2')
doc.setText('3')
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/johnsoncodehk/volar" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
