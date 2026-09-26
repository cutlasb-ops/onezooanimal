/*
  # Add INSERT policy for animal_categories

  Allows public insert on animal_categories so new categories can be created
  from the admin form when typing a category name that doesn't yet exist.
*/

CREATE POLICY "Allow public insert on animal_categories"
  ON animal_categories
  FOR INSERT
  WITH CHECK (true);
