<template>
    <div class="dragndrop"
         @dragenter.prevent="enter"
         @dragover.prevent="enter"
         @dragend.prevent="leave"
         @dragleave.prevent="leave"
         @drop.prevent="drop"
         :class="{ 'dragndrop--dragged' : isDraggedOver}"
    >
        <input type="file"
               name="files[]"
               id="file"
               class="dragndrop__input"
               multiple
               @change.prevent="select"
               ref="input"
        >
        <label for="file"
               class="dragndrop__header"
               :class="{'dragndrop__header--compact' : files.length >= 1}"
        >
            <strong>Drag files here</strong> or click to select file
        </label>

        <uploads :files="files"/>
    </div>
</template>

<script>
	import axios from 'axios'
	import Uploads from "./Uploads"
	// import eventHub from "../events"

	export default {
		components: {
			Uploads
		},

		data() {
			return {
				files: [],
				isDraggedOver: false
			}
		},

		methods: {
			enter() {
				this.isDraggedOver = true
			},

			leave() {
				this.isDraggedOver = false
			},

			drop(e) {
				this.leave()
				// console.log(e.dataTransfer.files)
				this.addFiles(e.dataTransfer.files)
			},

			select(e) {
				// console.log(this.$refs.input.files)
				this.addFiles(this.$refs.input.files)
			},

			addFiles(files) {
				var i, file;

				for (i = 0; i < files.length; i++) {
					file = files[i]

					this.storeMeta(file).then((fileObject) => {
						this.upload(fileObject)
					}).catch((fileObject) => {
						fileObject.failed = true
					})
				}
			},

			upload(fileObject) {
				var form = new FormData()

				form.append('file', fileObject.file)
				form.append('id', fileObject.id)

				axios.post(`http://cc-multiple-file-drag.test/upload.php`, form, {
					headers: {
						'Content-Type': 'multipart/form-data'
					},
					cancelToken: new axios.CancelToken(function executor(c) {
						fileObject.xhr = c;
					}),
					onUploadProgress: function (progressEvent) {
						// console.log(progressEvent.loaded)
						eventHub.$emit('progress', fileObject, progressEvent)
					}
				}).then(function ({data}) {
					// console.log('finished')
					eventHub.$emit('finished', fileObject)
				}).catch(function (e) {
					if (!fileObject.cancelled) {
						eventHub.$emit('failed', fileObject)
					}
				});
			},

			storeMeta(file) {
				var fileObject = this.generateFileObject(file)

				return new Promise((resolve, reject) => {
					axios.post(`http://cc-multiple-file-drag.test/store.php`, {
						name: file.name
					}).then((response) => {
						fileObject.id = response.data.data.id
						resolve(fileObject)
					}, () => {
						reject(fileObject)
					})
				})
			},

			generateFileObject(file) {
				var fileObjectIndex = this.files.push({
					id: null,
					file: file,
					progress: 0,
					failed: false,
					loadedBytes: 0,
					totalBytes: 0,
					timeStarted: (new Date).getTime(),
					secondsRemaining: 0,
					finished: false,
					cancelled: false,
					xhr: null
				}) - 1

				return this.files[fileObjectIndex];
			}
		}
	}
</script>

<style>
    .dragndrop {
        --dragndrop-min-height: 200px;
        width: 100%;
        min-height: var(--dragndrop-min-height);
        background-color: #f8f8f8;
        position: relative;
        border: 3px dashed rgba(0, 0, 0, .2);
    }

    .dragndrop--dragged {
        border-color: #333;
    }

    .dragndrop__input {
        display: none;
    }

    .dragndrop__header {
        display: block;
        font-size: 1.1em;
        color: #555;
        vertical-align: middle;
        text-align: center;
        margin: calc(var(--dragndrop-min-height) / 2) 20px;
    }

    .dragndrop__header:hover {
        text-decoration: underline;
        cursor: pointer;
    }

    .dragndrop__header--compact {
        margin: calc(var(--dragndrop-min-height) / 4) 20px;
    }
</style>