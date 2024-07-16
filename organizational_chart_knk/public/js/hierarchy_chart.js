import html2canvas from "html2canvas";

hrms.OrgChartKnk = class {
	constructor(doctype, wrapper, method) {
		this.page = wrapper.page;
		this.method = method;
		this.doctype = doctype;
		this.company = '';
		this.chart = null;
	}
	kanakshow() {
		this.setup_actions();
		if (this.page.main.find('[data-fieldname="companyabcd"]').length) {
			return;
		}
		let me = this;
		let company = this.page.add_field({
			fieldtype: "Link",
			options: "Company",
			fieldname: "companyabcd",
			placeholder: __("Select Company"),
			default: frappe.defaults.get_default("company"),
			only_select: true,
			reqd: 1,
			change: () => {
				me.company = "";
				if (company.get_value()) {
					me.company = company.get_value();
					me.make_main_tag();
				} else {
					frappe.throw(__("Please select a company first."));
				}
			},
		});

		company.refresh();
		$(`[data-fieldname="companyabcd"]`).trigger("change");
		$(`[data-fieldname="companyabcd"] .link-field`).css("z-index", 2);
	}
	setup_actions() {
		let me = this;
		this.page.clear_inner_toolbar();
		this.page.add_inner_button(__("Reset"), function () {
			me.reset_orgchart();
		});

		this.page.add_inner_button(__("Zoom in"), function () {
			me.zoom_in_chart();
		});
		this.page.add_inner_button(__("Zoom out"), function () {
			me.zoom_out_chart();
		});
		let exportdropdownHTML = `
	        <div class="btn-group">
	            <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
	                Export
	            </button>
	            <div class="dropdown-menu">
	                <a class="dropdown-item" href="#" id="export-current">Expand Current</a>
	                <a class="dropdown-item" href="#" id="export-full">Export Full</a>
	                <a class="dropdown-item" href="#" id="export-svg">Export SVG</a>
	                <a class="dropdown-item" href="#" id="export-pdf">Export PDF</a>
	            </div>
	        </div>
	    `;
	    this.page.inner_toolbar.append(exportdropdownHTML);
	    this.page.inner_toolbar.find('#export-current').click(function () {
            me.export_current();
        });
        this.page.inner_toolbar.find('#export-full').click(function () {
            me.export_full();
        });
        this.page.inner_toolbar.find('#export-svg').click(function () {
            me.export_svg();
        });
        this.page.inner_toolbar.find('#export-pdf').click(function () {
            me.export_pdf();
        });
		let dropdownHTML = `
	        <div class="btn-group">
	            <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
	                Actions
	            </button>
	            <div class="dropdown-menu">
	                <a class="dropdown-item" href="#" id="expand-all">Expand All</a>
	                <a class="dropdown-item" href="#" id="collapse-all">Collapse All</a>
	                <a class="dropdown-item" href="#" id="horizontal-all">Horizontal</a>
	                <a class="dropdown-item" href="#" id="compact-all">Compact</a>
	                <a class="dropdown-item" href="#" id="fullscreen-all">Fullscreen</a>
	                <a class="dropdown-item" href="#" id="fit-screen-all">Fit to the screen</a>
	                <a class="dropdown-item" href="#" id="right-chart">Right Chart</a>
	                <a class="dropdown-item" href="#" id="top-chart">Top Chart</a>
	                <a class="dropdown-item" href="#" id="left-chart">Left Chart</a>
	                <a class="dropdown-item" href="#" id="bottom-chart">Bottom Chart</a>
	                <a class="dropdown-item" href="#" id="active-node-center">Center Active Node</a>
	                <a class="dropdown-item" href="#" id="dont-active-node-center">Don't Center active Node</a>
	            </div>
	        </div>
	    `;
	    this.page.inner_toolbar.append(dropdownHTML);
	    this.page.inner_toolbar.find('#active-node-center').click(function () {
            me.active_node_center();
        });
        this.page.inner_toolbar.find('#dont-active-node-center').click(function () {
            me.dont_active_node_center();
        });

	    this.page.inner_toolbar.find('#expand-all').click(function () {
            me.expand_all();
        });
        this.page.inner_toolbar.find('#collapse-all').click(function () {
            me.collapse_all();
        });
        this.page.inner_toolbar.find('#export-chart').click(function () {
            me.export_chart();
        });
        this.page.inner_toolbar.find('#horizontal-all').click(function () {
            me.horizontal_all();
        });
        this.page.inner_toolbar.find('#compact-all').click(function () {
            me.compact_all();
        });
        this.page.inner_toolbar.find('#fullscreen-all').click(function () {
            me.fullscreen_all();
        });
        this.page.inner_toolbar.find('#right-chart').click(function () {
            me.right_chart();
        });
        this.page.inner_toolbar.find('#top-chart').click(function () {
            me.top_chart();
        });
        this.page.inner_toolbar.find('#left-chart').click(function () {
            me.left_chart();
        });
        this.page.inner_toolbar.find('#bottom-chart').click(function () {
            me.bottom_chart();
        });
        this.page.inner_toolbar.find('#fit-screen-all').click(function () {
            me.fit_screen_all();
        });
	    this.page.inner_toolbar.removeClass('hide');
	}
	reset_orgchart(){
	  $(`[data-fieldname="companyabcd"]`).trigger("change");
	}
	active_node_center(){
		this.chart.setActiveNodeCentered(true).render();
	}
	dont_active_node_center(){
		this.chart.setActiveNodeCentered(false).render();
	}
	export_current(){
		this.chart.exportImg();
	}
	export_full(){
		this.chart.exportImg({full:true});
	}
	export_svg(){
		this.chart.exportSvg();
	}
	export_pdf(){
		this.downloadPdf(this.chart)
	}
	downloadPdf(chart) {
	    chart.exportImg({
	      save: false,
	      full: true,
	      onLoad: (base64) => {
	        var pdf = new jspdf.jsPDF();
	        var img = new Image();
	        img.src = base64;
	        img.onload = function () {
	          pdf.addImage(
	            img,
	            'JPEG',
	            5,
	            5,
	            595 / 3,
	            ((img.height / img.width) * 595) / 3
	          );
	          pdf.save('chart.pdf');
	        };
	      },
	    });
	}
	fit_screen_all(){
		this.chart.fit();
	}
	zoom_in_chart(){
		this.chart.zoomIn();
	}
	zoom_out_chart(){
		this.chart.zoomOut();
	}
	right_chart(){
		this.chart.layout('right').render().fit();
	}
	top_chart(){
		this.chart.layout('top').render().fit();
	}
	left_chart(){
		this.chart.layout('left').render().fit();
	}
	bottom_chart(){
		this.chart.layout('bottom').render().fit();
	}
	expand_all(){
		this.chart.expandAll().fit();
	}
	collapse_all(){
		this.chart.collapseAll().fit();
	}
	compact_all(){
		this.chart.compact(true).render().fit();
	}
	horizontal_all(){
		this.chart.compact(false).render().fit();
	}
	fullscreen_all(){
		this.chart.fullscreen();
	}
	export_chart() {
		frappe.dom.freeze(__("Exporting..."));
		this.page.main.find("#orgchart_kanak_main").css({
			"min-height": "",
			"max-height": "",
			overflow: "visible",
			position: "fixed",
			left: "0",
			top: "0",
		});

		html2canvas(document.querySelector("#orgchart_kanak_main"), {
			scrollY: -window.scrollY,
			scrollX: 0,
		})
			.then(function (canvas) {
				let dataURL = canvas.toDataURL("image/png");
				let a = document.createElement("a");
				a.href = dataURL;
				a.download = "hierarchy_chart";
				a.click();
			})
			.finally(() => {
				frappe.dom.unfreeze();
			});

		this.setup_page_style();
	}
	setup_page_style() {
		this.page.main.find("#orgchart_kanak_main").css({
			"min-height": "100vh",
			"max-height": "100vh",
			overflow: "auto",
			position: "relative",
		});
	}
	setup_search() {
		    let me = this;
		    let searchInput = document.getElementById('employee-search');
		    searchInput.addEventListener('input', function(event) {
		        let searchText = event.target.value.trim().toLowerCase();
		        me.scroll_to_employee(searchText);
		    });
	}
	scroll_to_employee(employeeName) {
	    	this.chart.clearHighlighting();
		    const data = this.chart.data();
		    data.forEach((d) => (d._expanded = false));
		    data.forEach((d) => {
		      if (employeeName != '' && d.name.toLowerCase().includes(employeeName.toLowerCase())) {
		        d._highlighted = true;
		        d._expanded = true;
		      }
		    });
		    this.chart.data(data).render().fit();
	}
	make_main_tag() {
	    let me = this;
	    this.page.main.find("#orgchart_kanak_main").remove();
	    this.page.main.find(".kanak-search-container").remove();
	    this.page.main.append(`<div class="kanak-search-container">
	        <input type="text" id="employee-search" class="form-control" placeholder="Search Employee">
	    </div>`);
	    this.page.main.append(`
	        <div id="orgchart_kanak_main"></div>
	        `);
	    this.setup_page_style();
	    frappe.call({
		   method: 'organizational_chart_knk.organizational_chart.api.org_chart.get_flat_org_chart',
	        args: {
	          company: me.company
	        },
		    callback: function(r) {
		        if(r.message) {
		            const data = r.message;
		            me.makeOrgChart(data);
		            me.setup_search();
		        }
		    }
		});
	}
	makeOrgChart(data){
		var elmt = this.page.main.find("#orgchart_kanak_main")[0];
	    this.chart = new d3.OrgChart()
	        .nodeHeight((d) => 100 + 25)
	        .nodeWidth((d) => 220 + 2)
	        .childrenMargin((d) => 50)
	        .compactMarginBetween((d) => 35)
	        .compactMarginPair((d) => 30)
	        .neighbourMargin((a, b) => 20)
	        .nodeContent(function (d, i, arr, state) {
	            const color = '#FFFFFF';
	            const imageDiffVert = 25 + 2;
	            return `
	                <div style='width:${d.width}px;height:${d.height}px;padding-top:${imageDiffVert - 2}px;padding-left:1px;padding-right:1px'>
	                    <div style="font-family: 'Inter', sans-serif;background-color:${color};  margin-left:-1px;width:${d.width - 2}px;height:${d.height - imageDiffVert}px;border-radius:10px;border: 1px solid #E4E2E9">
	                        <div style="display:flex;justify-content:flex-end;margin-top:5px;margin-right:8px;height:14px;">${d.data.id}</div>
	                        <div style="background-color:${color};margin-top:${-imageDiffVert - 20}px;margin-left:${15}px;border-radius:100px;width:50px;height:50px;" ></div>
	                        <div style="margin-top:${-imageDiffVert - 20}px;">   <img src=" ${d.data.image}" style="margin-left:${20}px;border-radius:100px;width:40px;height:40px;" /></div>
	                        <div style="font-size:15px;color:#08011E;margin-left:20px;margin-top:10px">  ${d.data.name} </div>
	                        <div style="color:#716E7B;margin-left:20px;margin-top:3px;font-size:10px;"> ${d.data.position} </div>
	                        <button class="edit-button chart_only_action_call_time_cl" data-employee-id="${d.data.id}" style="margin-left:20px;margin-top:10px;background: black;color: white;border-radius: 5px;padding: 4px 7px;border: 1px solid;cursor:pointer;">Edit</button>
	                    </div>
	                </div>
	                `;
	        })
	        .container(elmt)
	        .data(data)
	        .render();
		$(elmt).on('click', '.chart_only_action_call_time_cl',  function() {
	            const employeeId = this.getAttribute('data-employee-id');
	            frappe.set_route('Form', 'Employee', employeeId);
	    });
	};

};