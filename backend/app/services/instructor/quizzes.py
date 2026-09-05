import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.assessment import Quiz, Question, QuizAttempt
from app.models.course import Course, Lesson
from app.schemas.instructor import (
    InstructorQuizCreate,
    InstructorQuizUpdate,
    InstructorQuizListItem,
    InstructorQuizDetail,
    InstructorQuestionItem,
)


def check_quiz_ownership(quiz_id: int, instructor_id: int, db: Session) -> Quiz:
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz with ID {quiz_id} not found."
        )
    # Check if creator matches, or if course instructor matches
    if quiz.creator_id == instructor_id:
        return quiz
    if quiz.course_id:
        course = db.query(Course).filter(Course.id == quiz.course_id).first()
        if course and course.instructor_id == instructor_id:
            return quiz
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to modify this quiz."
    )


def list_instructor_quizzes(instructor_id: int, db: Session) -> List[InstructorQuizListItem]:
    # Query quizzes created by instructor OR belonging to instructor courses
    instructor_course_ids = [c.id for c in db.query(Course.id).filter(Course.instructor_id == instructor_id).all()]
    quizzes = db.query(Quiz).filter(
        (Quiz.creator_id == instructor_id) | (Quiz.course_id.in_(instructor_course_ids))
    ).order_by(Quiz.created_at.desc()).all()

    results: List[InstructorQuizListItem] = []
    for q in quizzes:
        course_title = None
        if q.course_id:
            c = db.query(Course).filter(Course.id == q.course_id).first()
            if c:
                course_title = c.title
        
        lesson_title = None
        if q.lesson_id:
            l = db.query(Lesson).filter(Lesson.id == q.lesson_id).first()
            if l:
                lesson_title = l.title

        attempts_count = db.query(QuizAttempt).filter(QuizAttempt.quiz_id == q.id).count()

        results.append(InstructorQuizListItem(
            id=q.id,
            title=q.title,
            description=q.description,
            course_id=q.course_id,
            course_title=course_title,
            lesson_id=q.lesson_id,
            lesson_title=lesson_title,
            passing_score_percentage=q.passing_score_percentage,
            time_limit_minutes=q.time_limit_minutes,
            question_count=len(q.questions),
            attempts_count=attempts_count,
            is_published=q.is_published,
            created_at=q.created_at,
        ))

    return results


def create_instructor_quiz(instructor_id: int, data: InstructorQuizCreate, db: Session) -> Dict[str, Any]:
    # If course_id is provided, verify ownership
    if data.course_id:
        course = db.query(Course).filter(Course.id == data.course_id).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")
        if course.instructor_id != instructor_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not own this course.")

    quiz = Quiz(
        title=data.title,
        description=data.description,
        course_id=data.course_id,
        lesson_id=data.lesson_id,
        passing_score_percentage=data.passing_score_percentage,
        time_limit_minutes=data.time_limit_minutes,
        is_published=data.is_published,
        creator_id=instructor_id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    # Add questions
    for idx, q in enumerate(data.questions):
        options_val = q.options_json if isinstance(q.options_json, str) else json.dumps(q.options_json)
        db_question = Question(
            quiz_id=quiz.id,
            prompt=q.prompt,
            question_type=q.question_type,
            options_json=options_val,
            correct_answer=q.correct_answer,
            explanation=q.explanation,
            points=q.points,
            order=q.order if q.order > 0 else idx + 1,
        )
        db.add(db_question)

    db.commit()
    db.refresh(quiz)

    return {
        "id": quiz.id,
        "title": quiz.title,
        "question_count": len(quiz.questions),
        "is_published": quiz.is_published,
        "message": "Quiz created successfully."
    }


def get_instructor_quiz(quiz_id: int, instructor_id: int, db: Session) -> InstructorQuizDetail:
    quiz = check_quiz_ownership(quiz_id, instructor_id, db)

    course_title = None
    if quiz.course_id:
        c = db.query(Course).filter(Course.id == quiz.course_id).first()
        if c:
            course_title = c.title
    
    lesson_title = None
    if quiz.lesson_id:
        l = db.query(Lesson).filter(Lesson.id == quiz.lesson_id).first()
        if l:
            lesson_title = l.title

    questions_output = []
    for q in quiz.questions:
        questions_output.append(InstructorQuestionItem(
            id=q.id,
            prompt=q.prompt,
            question_type=q.question_type,
            options_json=q.options_json,
            correct_answer=q.correct_answer,
            explanation=q.explanation,
            points=q.points,
            order=q.order,
        ))

    return InstructorQuizDetail(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        course_id=quiz.course_id,
        course_title=course_title,
        lesson_id=quiz.lesson_id,
        lesson_title=lesson_title,
        passing_score_percentage=quiz.passing_score_percentage,
        time_limit_minutes=quiz.time_limit_minutes,
        is_published=quiz.is_published,
        questions=questions_output,
        created_at=quiz.created_at,
    )


def update_instructor_quiz(quiz_id: int, instructor_id: int, data: InstructorQuizUpdate, db: Session) -> Dict[str, Any]:
    quiz = check_quiz_ownership(quiz_id, instructor_id, db)

    if data.title is not None:
        quiz.title = data.title
    if data.description is not None:
        quiz.description = data.description
    if data.course_id is not None:
        quiz.course_id = data.course_id
    if data.lesson_id is not None:
        quiz.lesson_id = data.lesson_id
    if data.passing_score_percentage is not None:
        quiz.passing_score_percentage = data.passing_score_percentage
    if data.time_limit_minutes is not None:
        quiz.time_limit_minutes = data.time_limit_minutes
    if data.is_published is not None:
        quiz.is_published = data.is_published

    # Replace questions if provided
    if data.questions is not None:
        # Delete old questions and re-insert updated set
        db.query(Question).filter(Question.quiz_id == quiz.id).delete()
        for idx, q in enumerate(data.questions):
            options_val = q.options_json if isinstance(q.options_json, str) else json.dumps(q.options_json)
            db_question = Question(
                quiz_id=quiz.id,
                prompt=q.prompt,
                question_type=q.question_type,
                options_json=options_val,
                correct_answer=q.correct_answer,
                explanation=q.explanation,
                points=q.points,
                order=q.order if q.order > 0 else idx + 1,
            )
            db.add(db_question)

    db.commit()
    db.refresh(quiz)

    return {
        "id": quiz.id,
        "title": quiz.title,
        "is_published": quiz.is_published,
        "message": "Quiz updated successfully."
    }


def delete_instructor_quiz(quiz_id: int, instructor_id: int, db: Session) -> Dict[str, str]:
    quiz = check_quiz_ownership(quiz_id, instructor_id, db)
    db.delete(quiz)
    db.commit()
    return {"message": f"Quiz '{quiz.title}' deleted successfully."}


def set_quiz_published(quiz_id: int, instructor_id: int, is_published: bool, db: Session) -> Dict[str, Any]:
    quiz = check_quiz_ownership(quiz_id, instructor_id, db)
    quiz.is_published = is_published
    db.commit()
    return {
        "id": quiz.id,
        "is_published": quiz.is_published,
        "message": f"Quiz {'published' if is_published else 'unpublished'} successfully."
    }
