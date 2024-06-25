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
        employee.connections = get_connections(employee.id, employee.lft, employee.rgt)
        employee.expandable = bool(employee.connections)

    return employees

def get_connections(employee: str, lft: int, rgt: int) -> int:
    # Employee = frappe.qb.DocType("Employee")
    # query = (
    #     frappe.qb.from_(Employee)
    #     .select(Count(Employee.name))
    #     .where((Employee.lft > lft) & (Employee.rgt < rgt))
    # ).run()
    # return query[0][0]
    connections = frappe.get_list(
            "Employee",
            fields=["name as name"],
            filters=[["reports_to", "=", employee]],
        )
    return len(connections)
