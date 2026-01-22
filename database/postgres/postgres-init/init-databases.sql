-- Crear el usuario AlexDB si no existe
DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT 1 FROM pg_roles WHERE rolname = 'AlexDB'
   ) THEN
      CREATE ROLE "AlexDB" LOGIN PASSWORD '12345';
   END IF;
END
$$;

-- Crear las bases de datos si no existe
-- NOTA: si la base de datos ya existe, dará error, por eso hay que reiniciar el volumen cada vez
CREATE DATABASE evolution OWNER "AlexDB";
CREATE DATABASE n8n_db OWNER "AlexDB";
CREATE DATABASE memory_embeddings OWNER "AlexDB";

-- Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE evolution TO "AlexDB";
GRANT ALL PRIVILEGES ON DATABASE n8n_db TO "AlexDB";
GRANT ALL PRIVILEGES ON DATABASE memory_embeddings TO "AlexDB";

