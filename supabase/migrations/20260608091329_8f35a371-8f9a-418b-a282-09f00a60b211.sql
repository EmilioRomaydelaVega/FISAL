
CREATE POLICY "open_read_machine_docs" ON storage.objects FOR SELECT USING (bucket_id = 'machine-docs');
CREATE POLICY "open_insert_machine_docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'machine-docs');
CREATE POLICY "open_delete_machine_docs" ON storage.objects FOR DELETE USING (bucket_id = 'machine-docs');
CREATE POLICY "open_update_machine_docs" ON storage.objects FOR UPDATE USING (bucket_id = 'machine-docs');
