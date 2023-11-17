const neo4j = require('neo4j-driver')
const URL = 'neo4j+s://c1241c11.databases.neo4j.io:7687'
const USER = 'neo4j'
const PASSWORD = 'MpUbzQZNe9lor6jnNNvYqzOlZmaA-6cti3QZzu1NmjI'
driver = neo4j.driver(URL,  neo4j.auth.basic(USER, PASSWORD))

module.exports = driver.session();