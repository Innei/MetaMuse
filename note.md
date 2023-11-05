# DB Field migrations

## note

`secret` to `publicAt`
`hide` to `isPublish`
`music` removed, move to `meta`

`password` always be `string` type


## backup sql

pg_dump -U postgres -h localhost -p 5432 -v -f "./t.sql" meta-muse
pg_dump -U postgres -h localhost -p 5432 -F c -b -v -f "./t.backup" meta-muse


要实现备份恢复前自动清空数据库（如果它存在），或者在数据库不存在时自动创建它，你可以结合使用多个 PostgreSQL 命令工具。以下是一个基本流程：

1. **清空或创建数据库**：
   使用 `dropdb` 和 `createdb` 工具来实现。

   ```bash
   dropdb -U [username] -h [hostname] -p [port] [dbname] --if-exists
   createdb -U [username] -h [hostname] -p [port] [dbname]
   ```

   这两条命令首先会尝试删除指定的数据库（如果它存在的话），然后创建一个新的空数据库。使用 `--if-exists` 选项确保即使数据库不存在，`dropdb` 也不会返回错误。

2. **恢复备份**：

   - 对于自定义格式的备份：

     ```bash
     pg_restore -U [username] -h [hostname] -p [port] -d [dbname] [backup_file_path]
     ```

   - 对于 SQL 格式的备份：

     ```bash
     psql -U [username] -h [hostname] -p [port] -d [dbname] -a -f [backup_file_path]
     ```


首先清空所有表数据，然后再倒入 sql

```sql
DO $$
DECLARE
   table_name text;
BEGIN
   FOR table_name IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
   LOOP
      EXECUTE 'TRUNCATE TABLE "' || table_name || '" CASCADE'; -- PostgreSQL 将未用双引号包围的标识符（如表名和列名）转换为小写。因此，TRUNCATE TABLE Comment 会被解释为 TRUNCATE TABLE comment。但如果原始表名使用了大写或大小写混合，那么在引用时需要使用双引号。
   END LOOP;
END $$;
```



## UI Kit

https://github.com/tremorlabs/tremor
https://mantine.dev/