frappe.pages['organizational_chart'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Org chart',
		single_column: true
	});
	frappe.require([
		"org-chart-kanak.bundle.js"], () => {
		let kanak_organizational_chart;
		let method = "hrms.hr.page.organizational_chart.organizational_chart.get_children";
		kanak_organizational_chart = new hrms.OrgChartKnk("Employee", wrapper, method);
		frappe.breadcrumbs.add("HR");
		kanak_organizational_chart.kanakshow();
	});
};