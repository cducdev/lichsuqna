const webkitSpeechRecognition =
	window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new webkitSpeechRecognition();
recognition.lang = "vi-VN";
const simplemde = new SimpleMDE({
	element: document.querySelector(".article"),
	toolbar: [
		{
			name: "bold",
			action: SimpleMDE.toggleBold,
			className: "fa fa-bold",
			title: "Bold",
		},
		{
			name: "italic",
			action: SimpleMDE.toggleStrikethrough,
			className: "fa fa-strikethrough",
			title: "Strikethrough",
		},
		{
			name: "strikethrough",
			action: SimpleMDE.toggleItalic,
			className: "fa fa-italic",
			title: "Italic",
		},
		{
			name: "heading-1",
			action: SimpleMDE.toggleHeading1,
			className: "fa fa-header fa-header-x fa-header-1",
			title: "Bold",
		},
		{
			name: "heading-2",
			action: SimpleMDE.toggleHeading2,
			className: "fa fa-header fa-header-x fa-header-2",
			title: "Bold",
		},
		{
			name: "heading-3",
			action: SimpleMDE.toggleHeading3,
			className: "fa fa-header fa-header-x fa-header-3",
			title: "Bold",
		},
		"|",
		{
			name: "code",
			action: SimpleMDE.toggleCodeBlock,
			className: "fa fa-code",
			title: "Code",
		},
		{
			name: "quote",
			action: SimpleMDE.toggleBlockquote,
			className: "fa fa-quote-left",
			title: "Quote",
		},
		{
			name: "unordered-list",
			action: SimpleMDE.toggleUnorderedList,
			className: "fa fa-list-ul",
			title: "Generic List",
		},
		{
			name: "ordered-list",
			action: SimpleMDE.toggleOrderedList,
			className: "fa fa-list-ol",
			title: "Numbered List",
		},
		{
			name: "table",
			action: SimpleMDE.drawTable,
			className: "fa fa-table",
			title: "Insert Table",
		},
		{
			name: "horizontal-rule",
			action: SimpleMDE.drawHorizontalRule,
			className: "fa fa-minus",
			title: "Insert Horizontal Line",
		},
		{
			name: "clean-block",
			action: SimpleMDE.cleanBlock,
			className: "fa fa-eraser fa-clean-block",
			title: "Clean block",
		},
		"|",
		{
			name: "speechToText",
			action: () => {
				recognition.start();
				recognition.onresult = (e) => {
					let currentContent = simplemde.codemirror.getValue();
					simplemde.codemirror.setValue(
						currentContent + e.results[0][0].transcript + " "
					);
				};
			},
			className: "fa-solid fa-microphone",
			title: "Speech to Text",
		},
	],
});

// simplemde.codemirror.on("change", async () => {
// 	try {
// 		const content = simplemde.value();
// 		const lastChar = content.charAt(content.length - 1);
// 		if (lastChar == " ") {
// 			let data = await fetch(
// 				`/editor/auto-correct?${new URLSearchParams({
// 					sentences: content,
// 				})}`,
// 				{ method: "POST" }
// 			);
// 			console.log(data.json());
// 		}
// 	} catch (e) {
// 		console.log(e);
// 	}
// });
