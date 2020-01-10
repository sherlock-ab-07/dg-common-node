const listGroupsQuery = 'select g.group_id, g.group_name, g.isactive \n' +
    ', c.name as center_name, c.center_id\n' +
    'from groups g \n' +
    'join centers c \n' +
    'on g.center_id = c.center_id\n' +
    'and g.center_id IN ';

module.exports = {
    listGroupsQuery
};