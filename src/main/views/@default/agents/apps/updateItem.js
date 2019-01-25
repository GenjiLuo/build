Tea.context(function () {
	var scriptEditor = null;

	this.$delay(function () {
		this.$find("form input[name='name']").focus();
	});

	/**
	 * 提交成功
	 */
	this.submitSuccess = function () {
		alert("保存成功");
		window.location = this.from;
	};

	/**
	 * 数据源
	 */
	this.isLoaded = false;
	this.sourceCode = this.item.sourceCode;
	this.sourceDescription = "";

	this.changeSource = function () {
		var that = this;
		this.sourceDescription = this.sources.$find(function (k, v) {
			return v.code == that.sourceCode;
		}).description;

		if (!this.isLoaded) {
			this.isLoaded = true;
			return;
		}

		if (this.sourceCode == "script") {
			this.$delay(function () {
				this.selectScriptTab("path");
			});
		} else if (this.sourceCode == "webhook") {
			this.$delay(function () {
				this.$find("form input[name='webhookURL']").focus();
			});
		} else if (this.sourceCode == "file") {
			this.$delay(function () {
				this.$find("form input[name='filePath']").focus();
			});
		}
	};

	this.changeSource();

	/**
	 * 脚本
	 */
	this.scriptTab = this.item.sourceOptions.scriptType;
	if (this.scriptTab == null || this.scriptTab.length == 0) {
		this.scriptTab = "path";
	}
	if (this.scriptTab == "code") {
		this.$delay(function () {
			this.loadEditor();
		});
	}

	this.selectScriptTab = function (tab) {
		this.scriptTab = tab;

		if (tab == "path") {
			this.$delay(function () {
				this.$find("form input[name='scriptPath']").focus();
			});
		} else if (tab == "code") {
			this.$delay(function () {
				this.loadEditor();
			});
		}
	};

	this.loadEditor = function () {
		if (scriptEditor == null) {
			scriptEditor = CodeMirror.fromTextArea(document.getElementById("script-code-editor"), {
				theme: "idea",
				lineNumbers: true,
				value: "",
				readOnly: false,
				showCursorWhenSelecting: true,
				height: "auto",
				//scrollbarStyle: null,
				viewportMargin: Infinity,
				lineWrapping: true,
				highlightFormatting: false,
				indentUnit: 4,
				indentWithTabs: true
			});
		}
		if (this.item.sourceOptions.script != null && this.item.sourceOptions.script.length > 0) {
			scriptEditor.setValue(this.item.sourceOptions.script);
		} else {
			scriptEditor.setValue("#!/usr/bin/env bash\n\n# your commands here\n");
		}
		scriptEditor.save();
		scriptEditor.focus();

		var info = CodeMirror.findModeByMIME("text/x-sh");
		if (info != null) {
			scriptEditor.setOption("mode", info.mode);
			CodeMirror.modeURL = "/codemirror/mode/%N/%N.js";
			CodeMirror.autoLoadMode(scriptEditor, info.mode);
		}

		scriptEditor.on("change", function () {
			scriptEditor.save();
		});
	};

	/**
	 * 环境变量
	 */
	this.env = (this.item.sourceOptions.env != null) ? this.item.sourceOptions.env : [];
	this.envAdding = false;
	this.envAddingName = "";
	this.envAddingValue = "";

	if (this.item.sourceOptions.method == null) {
		this.item.sourceOptions.method = "GET";
	}
	if (this.item.sourceOptions.timeout == null) {
		this.item.sourceOptions.timeout = "30";
	} else {
		this.item.sourceOptions.timeout = this.item.sourceOptions.timeout.replace(/s$/, "");
	}

	this.item.interval = this.item.interval.replace(/s$/, "");

	this.addEnv = function () {
		this.envAdding = !this.envAdding;
		this.$delay(function () {
			this.$find("form input[name='envAddingName']").focus();
		});
	};

	this.confirmAddEnv = function () {
		if (this.envAddingName.length == 0) {
			alert("请输入变量名");
			this.$find("form input[name='envAddingName']").focus();
		}
		this.env.push({
			"name": this.envAddingName,
			"value": this.envAddingValue
		});
		this.envAdding = false;
		this.envAddingName = "";
		this.envAddingValue = "";
	};

	this.removeEnv = function (index) {
		this.env.$remove(index);
	};

	this.cancelEnv = function () {
		this.envAdding = false;
	};

	/**
	 * 更多选项
	 */
	this.advancedOptionsVisible = false;
	this.showAdvancedOptions = function () {
		this.advancedOptionsVisible = !this.advancedOptionsVisible;
	};

	/**
	 * 阈值
	 */
	this.conds = [];

	if (this.item.thresholds.length > 0) {
		this.conds = this.item.thresholds.$map(function (k, v) {
			return {
				"param": v.param,
				"op": v.operator,
				"value": v.value,
				"description": "",
				"noticeLevel": v.noticeLevel,
				"noticeMessage": v.noticeMessage
			};
		});
	}

	this.addCond = function () {
		this.conds.push({
			"param": "${0}",
			"op": "eq",
			"value": "",
			"description": "",
			"noticeLevel": 2,
			"noticeMessage": ""
		});
		this.changeCondOp(this.conds.$last());
		this.$delay(function () {
			this.$find("form input[name='condParams']").last().focus();
			window.scroll(0, 10000);
		});
	};

	this.changeCondOp = function (cond) {
		cond.description = this.operators.$find(function (k, v) {
			return cond.op == v.op;
		}).description;
	};

	this.removeCond = function (index) {
		this.conds.$remove(index);
	};
});