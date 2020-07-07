<template>
    <div>
        <div class="dragndrop__status" v-if="files.length">
            <ul class="list-inline">
                <li class="list-inline__item">Files: {{ files.length }}</li>
                <li class="list-inline__item">Percentage: {{ overallProgress }}%</li>
                <li class="list-inline__item list-inline__item--last">Time Remaining: 00:00</li>
            </ul>
        </div>
        <file v-for="file in files"
              :file="file"
        >
        </file>
    </div>
</template>

<script>
	import File from "./File";

	export default {
		props: [
			'files'
		],

		components: {
			File
		},

        data() {
			return {
			    overallProgress: 0
            }
        },

        mounted() {
			eventHub.$on('progress', (fileObject, e) => {
				this.updateOverallProgress()
            })
        },

        methods: {
			unfinishedFiles() {
				var i, files = []

                for(i = 0; i < this.files.length; i++) {
                	if (this.files[i].finished || this.files[i].cancelled) {
                		continue
                    }

                	files.push(this.files[i])
                }

                return files
            },
			updateOverallProgress() {
                var unfinishedFiles = this.unfinishedFiles(), totalProgress = 0

                unfinishedFiles.forEach((file) => {
                	totalProgress += file.progress
                })

                this.overallProgress = parseInt(totalProgress / unfinishedFiles.length || 0)
            }
        }
	}
</script>

<style>
    .dragndrop__status {
        text-align: center;
        padding: 20px;
    }
</style>