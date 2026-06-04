<script setup>
</script>

<template>
	<RouterView></RouterView>
</template>

<style scoped>
.beian-footer {
	position: fixed;
	left: 12px;
	bottom: 12px;
	display: flex;
	gap: 10px;
	align-items: center;
	font-size: 12px;
	z-index: 9999;
}

.beian-footer a {
	color: #666;
	text-decoration: none;
}

.beian-footer a:hover {
	text-decoration: underline;
}
</style>
