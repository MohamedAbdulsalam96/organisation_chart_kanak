import frappe
from frappe.query_builder.functions import Count


@frappe.whitelist()
def get_children(parent=None, company=None, exclude_node=None):
    filters = [["status", "!=", "Left"]]
    if company and company != "All Companies":
        child_companys = frappe.get_list(
            "Company",
            fields=["company_name as name"],
            filters=[["parent_company", "=", company]],
        )
        compnies = [company]
        for cmpn in child_companys:
            compnies.append(cmpn.get('name'))
        filters.append(["company", "in", compnies])

    if parent and company and parent != company:
        filters.append(["reports_to", "=", parent])
    else:
        filters.append(["reports_to", "=", ""])

    if exclude_node:
        filters.append(["name", "!=", exclude_node])
    employees = frappe.get_list(
        "Employee",
        fields=["employee_name as name", "name as id", "reports_to", "image", "designation as title"],
        filters=filters,
        order_by="name",
    )

    for employee in employees:
        if not employee.get("image"):
            employee["image"] = "/assets/organizational_chart_knk/files/empl.png"
        employee.connections = get_connections(employee.id, employee.lft, employee.rgt)
        employee.expandable = bool(employee.connections)

    return employees


def get_connections(employee: str, lft: int, rgt: int) -> int:
    connections = frappe.get_list(
            "Employee",
            fields=["name as name"],
            filters=[["reports_to", "=", employee]],
        )
    return len(connections)


@frappe.whitelist()
def get_org_chart(company=None):
    root_employees = get_children(parent=None, company=company)
    if not root_employees:
        return {}

    root_employee = root_employees[0]

    def build_children(parent_id):
        children = get_children(parent=parent_id, company=company)
        if not children:
            return []  # Terminate recursion if no children found

        processed_children = []
        for child in children:
            child_data = {
                "key": child["id"],
                "label": root_employee["name"],
                "type": "person",
                "data": {
                    "image": child.get("image", "/assets/organizational_chart_knk/files/empl.png"),
                    "name": child["name"],
                    "title": child["title"] or '',
                    "empid": child["id"],
                    'connections': child["connections"]
                },
            }
            grand_children = build_children(child["id"])
            if grand_children:
                child_data["children"] = grand_children

            processed_children.append(child_data)

        return processed_children

    org_chart_data = {
        "key": root_employee["id"],
        "label": root_employee["name"],
        "type": "person",
        "data": {
            "image": root_employee["image"],
            "name": root_employee["name"],
            "title": root_employee["title"] or '',
            "empid": root_employee["id"],
            'connections': root_employee["connections"]
        },
        "children": build_children(root_employee["id"])
    }
    return org_chart_data


@frappe.whitelist()
def get_flat_org_chart(company=None):
    org_chart_data = get_org_chart(company)
    if not org_chart_data:
        return {}
    flat_data = []

    def flatten_chart(node, parent_id=None):
        flat_data.append({
            'id': node['key'],
            'name': node['data']['name'],
            'position': node['data']['title'],
            'image': node['data']['image'],
            'parentId': parent_id
        })
        for child in node.get('children', []):
            flatten_chart(child, node['key'])

    flatten_chart(org_chart_data)
    return flat_data