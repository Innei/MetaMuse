type NormalizedNoteModel = NonNullable<
  Awaited<ReturnType<import('./note.service').NoteService['getNoteById']>>
>
