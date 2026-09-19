<script setup lang="ts">
import { VIDEO_ACCEPT } from '~/utils/convert'
import { muteExt, muteVideo } from './convert'
</script>

<template>
  <ConvertFlow :accept="VIDEO_ACCEPT" :output-ext="muteExt" :run="muteVideo" />
</template>
